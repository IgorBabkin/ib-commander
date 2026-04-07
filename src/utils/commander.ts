import { getMethodMeta, methodMeta } from 'ts-ioc-container';
import { Command } from 'commander';

export const command = (command: Command) => methodMeta('command', () => command);
export const getCommandOrFail = (target: object, propertyKey: string) => {
  const command = getMethodMeta('command', target, propertyKey) as Command | undefined;
  if (!command) {
    throw new Error(`Unable to find command ${propertyKey}`);
  }
  return command;
};
