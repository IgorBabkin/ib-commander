import { HookFn } from 'ts-ioc-container';
import { getCommand, getSchema } from './decorators.js';

export const execute = (): HookFn => (c) => {
  const resolveCmd = getCommand(c.instance, c.methodName!);
  const schema = getSchema(c.instance, c.methodName!);

  if (resolveCmd) {
    const command = resolveCmd(c.scope);
    const rawArgs = c.resolveArgs() as string[];
    const flagsStart = rawArgs.findIndex((a) => a.startsWith('-'));
    command.parse(flagsStart >= 0 ? ['node', 'script', ...rawArgs.slice(flagsStart)] : ['node', 'script']);
    const opts = schema ? schema(c.scope).parse(command.opts()) : command.opts();
    c.invokeMethod({ args: [opts] });
  } else {
    c.invokeMethod();
  }
};
