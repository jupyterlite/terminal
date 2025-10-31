import {
  ansi,
  BooleanArgument,
  CommandArguments,
  ExitCode,
  IExternalRunContext,
  IExternalTabCompleteContext,
  IExternalTabCompleteResult,
  PathType,
  PositionalArguments,
  SubcommandArguments
} from '@jupyterlite/cockle';
import { CommandRegistry } from '@lumino/commands';
import { PartialJSONObject } from '@lumino/coreutils';

class DescribeSubcommand extends SubcommandArguments {
  positional = new PositionalArguments({
    min: 1,
    tabComplete: async (context: IExternalTabCompleteContext) => {
      const liteCommand: LiteCommand | undefined = (context as any).liteCommand;
      return { possibles: liteCommand?.commandNames() ?? [] };
    }
  });
}

class ListSubcommand extends SubcommandArguments {}

class RunSubcommand extends SubcommandArguments {
  positional = new PositionalArguments({
    min: 1,
    tabComplete: async (context: IExternalTabCompleteContext) => {
      const liteCommand: LiteCommand | undefined = (context as any).liteCommand;
      let possibles: string[] | undefined = undefined;
      if (liteCommand !== undefined) {
        const { args } = context;
        if (args.length === 1) {
          // Command name.
          possibles = liteCommand.commandNames();
        } else if (args.length % 2 === 0) {
          // Argument name.
          const commandName = args[0];
          possibles = await liteCommand.argumentNames(commandName);
        } else {
          // Argument value corresponding to the previous argument name.
          const commandName = args[0];
          const argumentName = args[args.length - 2];
          const typeAndValues = await liteCommand.argumentTypeAndValues(
            commandName,
            argumentName
          );
          possibles = typeAndValues?.values;
          if (
            (possibles === undefined || possibles.length === 0) &&
            typeAndValues?.type === 'string'
          ) {
            // Match on path
            return { pathType: PathType.Any };
          }
        }
      }
      return { possibles };
    }
  });
}

class LiteCommandArguments extends CommandArguments {
  help = new BooleanArgument('h', 'help', 'display this help and exit');
  subcommands = {
    list: new ListSubcommand('list', 'list available JupyterLite commands.'),
    describe: new DescribeSubcommand(
      'describe',
      'describe one or more JupyterLite commands.'
    ),
    run: new RunSubcommand('run', 'Run a JupyterLite command')
  };
}

export class LiteCommand {
  constructor(readonly commandRegistry: CommandRegistry) {}

  async run(context: IExternalRunContext): Promise<number> {
    const { stdout } = context;
    const args = new LiteCommandArguments().parse(context.args);
    const { subcommands } = args;

    if (args.help.isSet) {
      args.writeHelp(stdout);
      return ExitCode.SUCCESS;
    }

    if (subcommands.list.isSet) {
      this.commandNames().forEach(name => stdout.write(name + '\n'));
    } else if (subcommands.describe.isSet) {
      let started = false;
      for (const name of subcommands.describe.positional.strings) {
        if (started) {
          stdout.write('\n');
        } else {
          started = true;
        }
        await this._describeCommand(context, name);
      }
    } else if (subcommands.run.isSet) {
      const argumentsAndValues = subcommands.run.positional.strings;
      const name = argumentsAndValues.shift()!;
      await this._runCommand(name, argumentsAndValues);
    } else {
      return ExitCode.GENERAL_ERROR;
    }

    return ExitCode.SUCCESS;
  }

  async tabComplete(
    context: IExternalTabCompleteContext
  ): Promise<IExternalTabCompleteResult> {
    const extendedContext = { ...context, liteCommand: this };
    return await new LiteCommandArguments().tabComplete(extendedContext);
  }

  /**
   * Return the argument names of a JupyterLite command.
   */
  async argumentNames(commandName: string): Promise<string[]> {
    const description = await this.commandRegistry.describedBy(commandName);
    const properties = description.args?.properties as any;
    if (properties) {
      return Object.keys(properties);
    }
    return [];
  }

  /**
   * Return the type and possible values of a JupyterLite command.
   */
  async argumentTypeAndValues(
    commandName: string,
    argumentName: string
  ): Promise<{ type: string; values: string[] | undefined } | undefined> {
    const description = await this.commandRegistry.describedBy(commandName);
    const properties = description.args?.properties as any;
    if (properties) {
      const property = properties[argumentName];
      if (property) {
        const type = property['type'] ?? '';
        let values: string[] | undefined = undefined;
        if (type === 'string') {
          const enum_ = property['enum'];
          if (enum_ && Array.isArray(enum_)) {
            values = enum_.map(item => String(item));
          }
        }

        // boolean possibles ????

        return { type, values };
      }
    }
    return undefined;
  }

  /**
   * Return sorted list of JupyterLite command names.
   */
  commandNames(): string[] {
    return this.commandRegistry
      .listCommands()
      .filter(n => !n.startsWith('_'))
      .sort();
  }

  /**
   * Describe named command.
   * @param name Name of command to describe.
   */
  private async _describeCommand(
    context: IExternalRunContext,
    name: string
  ): Promise<void> {
    if (!this._hasCommand(name)) {
      throw new Error(`No such JupyterLite command: ${name}`);
    }

    const { environment, stdout } = context;
    let colorize = (text: string): string => text;
    if (stdout.supportsAnsiEscapes()) {
      const isDarkMode = environment.get('COCKLE_DARK_MODE') === '1';
      const color = isDarkMode ? ansi.styleBrightBlue : ansi.styleBlue;
      colorize = (text: string): string => color + text + ansi.styleReset;
    }

    const caption = this.commandRegistry.caption(name);
    const label = this.commandRegistry.label(name);
    const usage = this.commandRegistry.usage(name);

    stdout.write(`${colorize('name:')} ${name}\n`);
    if (caption && caption.length > 0) {
      stdout.write(`${colorize('caption:')} ${caption}\n`);
    }
    if (label && label.length > 0) {
      stdout.write(`${colorize('label:')} ${label}\n`);
    }
    if (usage && usage.length > 0) {
      stdout.write(`${colorize('usage:')} ${usage}\n`);
    }

    const description = await this.commandRegistry.describedBy(name);
    const properties = description.args?.properties as any;
    if (properties) {
      const argNames = Object.keys(properties);
      if (argNames.length > 0) {
        stdout.write(`${colorize('arguments:')}\n`);
      }

      for (const argName of argNames) {
        const arg = properties[argName];
        stdout.write(`  ${argName}\n`);
        stdout.write(`    ${colorize('description:')} ${arg.description}\n`);

        const typeAndValues = await this.argumentTypeAndValues(name, argName);
        if (typeAndValues !== undefined) {
          const { type, values } = typeAndValues;
          stdout.write(`    ${colorize('type:')} ${type}\n`);
          if (values !== undefined) {
            stdout.write(
              `    ${colorize('possible values:')} ${values.join(' ')}\n`
            );
          }
        }
      }
    }

    const required = description.args?.required;
    if (required !== undefined && Array.isArray(required)) {
      stdout.write(
        `${colorize('required arguments:')} ${required.join(' ')}\n`
      );
    }

    stdout.write(
      `${colorize('isEnabled:')} ${this.commandRegistry.isEnabled(name)}\n`
    );
    stdout.write(
      `${colorize('isToggleable:')} ${this.commandRegistry.isToggleable(name)}\n`
    );
    stdout.write(
      `${colorize('isVisible:')} ${this.commandRegistry.isVisible(name)}\n`
    );
  }

  private _hasCommand(commandName: string): boolean {
    // This is more permissive than this.commandNames() which has some commands filtered out
    // so that they will not appear when using tab completion.
    return this.commandRegistry.hasCommand(commandName);
  }

  /**
   * Run JupyterLite command, throws an exception if fails.
   * @param name
   * @param argumentsAndValues
   */
  private async _runCommand(
    name: string,
    argumentsAndValues: string[]
  ): Promise<void> {
    if (!this._hasCommand(name)) {
      throw new Error(`No such JupyterLite command: ${name}`);
    }

    // Validate argument types and values.
    const commandArgs: PartialJSONObject = {};
    const validArgNames = await this.argumentNames(name);

    while (argumentsAndValues.length > 0) {
      const argName = argumentsAndValues.shift()!;
      const argValue = argumentsAndValues.shift();
      if (!validArgNames.includes(argName)) {
        throw new Error(
          `JupyterLite command ${name} does not accept ${argName} argument`
        );
      }
      if (argValue === undefined) {
        throw new Error(
          `No value given for ${argName} argument to JupyterLite command ${name}`
        );
      }
      const validArgValues = await this.argumentTypeAndValues(name, argName);
      // If nothing known about argument then cannot validate it.
      if (validArgValues !== undefined) {
        // validate type...
        // may need to convert type or is string always acceptable????

        if (
          validArgValues.values !== undefined &&
          !validArgValues.values.includes(argValue)
        ) {
          throw new Error(
            `${argValue} is not valid for argument ${argName}. Acceptable values are: ${validArgValues.values.join(' ')}`
          );
        }
      }
      commandArgs[argName] = argValue;
    }

    // Validate required arguments.
    const description = await this.commandRegistry.describedBy(name);
    const required = description.args?.required;
    if (required !== undefined && Array.isArray(required)) {
      const missing = required.filter(x => !(x in commandArgs));
      if (missing.length > 0) {
        throw new Error(
          `JupyterLite command ${name} is missing required argument(s): ${missing.join(' ')}`
        );
      }
    }

    // Run command.
    await this.commandRegistry.execute(name, commandArgs);
  }
}
