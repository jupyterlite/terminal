import { expect, test } from '@jupyterlab/galata';
import type { IJupyterLabPageFixture } from '@jupyterlab/galata';

const EXECUTE_BASH = '@jupyterlite/terminal:execute-bash';
const START_TERMINAL = '@jupyterlite/terminal:start-terminal';
const SHUTDOWN_TERMINAL = '@jupyterlite/terminal:shutdown-terminal';
const LIST_TERMINALS = '@jupyterlite/terminal:list-terminals';

async function execute(
  page: IJupyterLabPageFixture,
  id: string,
  args: Record<string, any> = {}
) {
  return await page.evaluate(
    ({ id, args }) => window.galata.app.commands.execute(id, args),
    { id, args }
  );
}

test.describe('programmatic commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto();
  });

  test('execute-bash captures output and exit code', async ({ page }) => {
    const result = await execute(page, EXECUTE_BASH, { code: 'echo hello' });
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('hello');

    // The throwaway shell is disposed once the command finishes.
    const list = await execute(page, LIST_TERMINALS);
    expect(list.count).toBe(0);
  });

  test('execute-bash reports a non-zero exit code', async ({ page }) => {
    const result = await execute(page, EXECUTE_BASH, { code: 'false' });
    expect(result.success).toBe(false);
    expect(result.status).toBe('error');
    expect(result.exitCode).not.toBe(0);
  });

  test('start, reuse, list and shutdown a headless shell', async ({ page }) => {
    const started = await execute(page, START_TERMINAL);
    expect(started.success).toBe(true);
    const name = started.terminalName;

    let list = await execute(page, LIST_TERMINALS);
    expect(list.count).toBe(1);
    expect(list.terminals[0].name).toBe(name);

    // State persists across calls on the same shell.
    await execute(page, EXECUTE_BASH, { code: 'cd /', terminalName: name });
    const pwd = await execute(page, EXECUTE_BASH, {
      code: 'pwd',
      terminalName: name
    });
    expect(pwd.output.trim()).toBe('/');

    await execute(page, SHUTDOWN_TERMINAL, { terminalName: name });
    list = await execute(page, LIST_TERMINALS);
    expect(list.count).toBe(0);
  });
});
