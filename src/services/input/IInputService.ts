import { SingleToken } from 'ts-ioc-container';
import { z } from 'zod';
import { Command } from 'commander';

export interface IInputService {
  readOptionsOrFail<T extends z.ZodTypeAny>(mapCommand: (cmd: Command) => Command, schema: T): z.infer<T>;
}
export const IInputServiceKey = new SingleToken<IInputService>('IInputService');
export const readInput = <T extends z.ZodTypeAny>(mapCommand: (cmd: Command) => Command, schema: T) =>
  IInputServiceKey.select((s) => s.readOptionsOrFail(mapCommand, schema));
