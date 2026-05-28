// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import type { IShell } from '@jupyterlite/cockle';
import type { CommandRegistry } from '@lumino/commands';

import { ILiteTerminalAPIClient } from './tokens';

/**
 * Default timeout (in milliseconds) for execute-bash commands.
 */
const DEFAULT_TIMEOUT_MS = 30000;

type BashExecutionStatus = 'ok' | 'error' | 'timeout';

interface IExecuteBashResult {
  success: boolean;
  status: BashExecutionStatus;
  output: string;
  exitCode: number | null;
  terminalName: string;
  duration: number;
  message: string;
}

interface ITerminalListItem {
  name: string;
}

const COMMAND_IDS = {
  executeBash: '@jupyterlite/terminal:execute-bash',
  startTerminal: '@jupyterlite/terminal:start-terminal',
  shutdownTerminal: '@jupyterlite/terminal:shutdown-terminal',
  listTerminals: '@jupyterlite/terminal:list-terminals'
} as const;

interface IHeadlessSession {
  shell: IShell;
  output: string;
  busy: boolean;
  timedOut: boolean;
}

/**
 * A pool of headless cockle shells used by the exec commands. These shells
 * are independent of the JupyterLab terminal service, so they do not appear
 * in the terminal widget list or in `LiteTerminalAPIClient.listRunning()`.
 */
class HeadlessShellPool {
  constructor(client: ILiteTerminalAPIClient) {
    this._client = client;
  }

  async create(options: { cwd?: string }): Promise<IHeadlessSession> {
    const name = this._nextAvailableName();
    let output = '';
    // Empty PS1 so the shell prints no prompt, keeping the captured output clean.
    const shell = await this._client.createHeadlessShell({
      shellId: name,
      cwd: options.cwd,
      environment: { PS1: '' },
      outputCallback: text => {
        output += text;
      }
    });
    const session: IHeadlessSession = {
      shell,
      get output() {
        return output;
      },
      busy: false,
      timedOut: false
    };
    this._sessions.set(name, session);
    shell.disposed.connect(() => {
      // Keep the pool in sync if the shell disposes itself (e.g. on init failure).
      this._sessions.delete(name);
    });
    return session;
  }

  get(name: string): IHeadlessSession | undefined {
    return this._sessions.get(name);
  }

  names(): string[] {
    return Array.from(this._sessions.keys());
  }

  async shutdown(name: string): Promise<void> {
    const session = this._sessions.get(name);
    if (!session) {
      throw new Error(`No headless shell found with name '${name}'`);
    }
    this._sessions.delete(name);
    session.shell.dispose();
  }

  private _nextAvailableName(): string {
    return `headless-${this._nextId++}`;
  }

  private _client: ILiteTerminalAPIClient;
  private _sessions = new Map<string, IHeadlessSession>();
  private _nextId = 1;
}

/**
 * Normalize the raw shell output for callers that expect pipe-like text. The
 * captured buffer echoes back the submitted command and uses `\r\n` line
 * endings, so strip the echoed command line and convert `\r\n` to `\n`.
 */
function cleanCapturedOutput(captured: string, code: string): string {
  const normalized = captured.replace(/\r\n/g, '\n');
  const expected = code + '\n';
  if (normalized.startsWith(expected)) {
    return normalized.slice(expected.length);
  }
  return normalized;
}

async function runOnSession(
  session: IHeadlessSession,
  code: string,
  timeout: number
): Promise<IExecuteBashResult> {
  const shellId = session.shell.shellId;
  // Fold any CR/CRLF inside the command to `\n` so it runs as a single command
  // rather than one line at a time when submitted with a trailing `\r`.
  const command = code.trim().replace(/\r\n?/g, '\n');
  if (command.length === 0) {
    return {
      success: false,
      status: 'error',
      output: '',
      exitCode: null,
      terminalName: shellId,
      duration: 0,
      message: 'No command to run'
    };
  }

  // A timed-out command keeps running, so the session is left in an unknown
  // state; refuse to reuse it. Also refuse overlapping commands, whose input
  // and captured output would otherwise interleave.
  if (session.timedOut) {
    throw new Error(
      `Headless shell '${shellId}' is no longer usable after a command timed out`
    );
  }
  if (session.busy) {
    throw new Error(`Headless shell '${shellId}' is already running a command`);
  }
  session.busy = true;

  const startTime = Date.now();
  const startLen = session.output.length;
  // `input()` resolves only after the command has finished, so it doubles as
  // the "command finished" signal. A running command cannot be interrupted, so
  // race it against a timer to avoid hanging on one that blocks (e.g. on stdin).
  const inputDone = session.shell.input(command + '\r').then(
    () => false,
    () => false // a late rejection (e.g. disposed shell) counts as finished
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = await Promise.race([
    inputDone,
    new Promise<boolean>(resolve => {
      timer = setTimeout(() => resolve(true), timeout);
    })
  ]);
  if (timer !== undefined) {
    clearTimeout(timer);
  }
  session.busy = false;
  if (timedOut) {
    session.timedOut = true;
  }

  const output = cleanCapturedOutput(session.output.slice(startLen), command);
  const duration = Date.now() - startTime;

  if (timedOut) {
    return {
      success: false,
      status: 'timeout',
      output,
      exitCode: null,
      terminalName: shellId,
      duration,
      message: `Command timed out after ${timeout}ms`
    };
  }

  const exitCode = await session.shell.exitCode();
  return {
    success: exitCode === 0,
    status: exitCode === 0 ? 'ok' : 'error',
    output,
    exitCode,
    terminalName: shellId,
    duration,
    message:
      exitCode === 0
        ? 'Command executed successfully'
        : `Command failed with exit code ${exitCode}`
  };
}

function registerCommands(
  commands: CommandRegistry,
  pool: HeadlessShellPool
): void {
  commands.addCommand(COMMAND_IDS.executeBash, {
    label: 'Execute Bash',
    caption:
      'Execute a bash command in a headless cockle shell and capture the output',
    describedBy: {
      args: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description:
              'The bash command to execute. Runs as a single pipeline: pipes (|), sequential separators (;), and file redirections (>, >>, 2>, <) are supported. Not supported (cockle limitations): chaining with && or ||, command substitution ($(...) and backticks), environment variable expansion ($VAR), and file-descriptor duplication (2>&1).'
          },
          terminalName: {
            type: 'string',
            description:
              'Name of an existing headless shell to reuse. If not provided, a new shell is created and shut down after execution.'
          },
          cwd: {
            type: 'string',
            description:
              'Working directory for a newly created headless shell. Ignored when reusing an existing session via terminalName.'
          },
          timeout: {
            type: 'number',
            description: `Maximum time in milliseconds to wait for the command before returning a timeout result (default: ${DEFAULT_TIMEOUT_MS}). Cockle cannot interrupt a running command, so it keeps running after a timeout.`
          }
        },
        required: ['code']
      }
    },
    execute: async (args: any): Promise<IExecuteBashResult> => {
      const code = args?.code;
      const terminalName = args?.terminalName;
      const cwd = args?.cwd;
      const timeout = args?.timeout ?? DEFAULT_TIMEOUT_MS;

      if (typeof code !== 'string' || code.length === 0) {
        throw new Error('code is required and must be a non-empty string');
      }
      if (terminalName !== undefined && typeof terminalName !== 'string') {
        throw new Error('terminalName must be a string');
      }
      if (cwd !== undefined && typeof cwd !== 'string') {
        throw new Error('cwd must be a string');
      }
      if (
        typeof timeout !== 'number' ||
        !Number.isFinite(timeout) ||
        timeout <= 0
      ) {
        throw new Error('timeout must be a positive number');
      }

      let session: IHeadlessSession;
      let disposeAfter = false;

      if (terminalName) {
        const existing = pool.get(terminalName);
        if (!existing) {
          throw new Error(
            `No headless shell found with name '${terminalName}'`
          );
        }
        session = existing;
      } else {
        session = await pool.create({ cwd });
        disposeAfter = true;
      }

      try {
        return await runOnSession(session, code, timeout);
      } finally {
        if (disposeAfter) {
          try {
            await pool.shutdown(session.shell.shellId);
          } catch {
            // Best-effort: do not mask the real result with a teardown error.
          }
        }
      }
    }
  });

  commands.addCommand(COMMAND_IDS.startTerminal, {
    label: 'Start Headless Terminal',
    caption:
      'Start a new headless cockle shell that can be reused via execute-bash',
    describedBy: {
      args: {
        type: 'object',
        properties: {
          cwd: {
            type: 'string',
            description:
              'Working directory for the new headless shell (optional).'
          }
        }
      }
    },
    execute: async (args: any) => {
      const cwd = args?.cwd;
      if (cwd !== undefined && typeof cwd !== 'string') {
        throw new Error('cwd must be a string');
      }
      const session = await pool.create({ cwd });
      return {
        success: true,
        message: `Headless shell '${session.shell.shellId}' started successfully`,
        terminalName: session.shell.shellId
      };
    }
  });

  commands.addCommand(COMMAND_IDS.shutdownTerminal, {
    label: 'Shutdown Headless Terminal',
    caption: 'Shut down a running headless cockle shell by name',
    describedBy: {
      args: {
        type: 'object',
        properties: {
          terminalName: {
            type: 'string',
            description: 'The name of the headless shell to shut down.'
          }
        },
        required: ['terminalName']
      }
    },
    execute: async (args: any) => {
      const terminalName = args?.terminalName;
      if (typeof terminalName !== 'string' || terminalName.length === 0) {
        throw new Error(
          'terminalName is required and must be a non-empty string'
        );
      }
      await pool.shutdown(terminalName);
      return {
        success: true,
        message: `Headless shell '${terminalName}' shut down successfully`,
        terminalName
      };
    }
  });

  commands.addCommand(COMMAND_IDS.listTerminals, {
    label: 'List Headless Terminals',
    caption:
      'List running headless cockle shells (does not include user-opened terminals)',
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const names = pool.names();
      const terminals: ITerminalListItem[] = names.map(name => ({ name }));
      return {
        success: true,
        terminals,
        count: terminals.length,
        available: true
      };
    }
  });
}

/**
 * Plugin that registers headless shell exec commands backed by cockle.
 * These run bash code in a headless shell and capture its output and exit
 * code, without opening a terminal widget in the UI.
 */
export const terminalExecPlugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlite/terminal:exec',
  description: 'AI-friendly headless shell exec commands backed by cockle',
  autoStart: true,
  requires: [ILiteTerminalAPIClient],
  activate: (
    app: JupyterFrontEnd,
    liteTerminalAPIClient: ILiteTerminalAPIClient
  ): void => {
    const pool = new HeadlessShellPool(liteTerminalAPIClient);
    registerCommands(app.commands, pool);
  }
};
