import { SingleToken } from 'ts-ioc-container';
import { z } from 'zod';
import { Command } from 'commander';

export interface IInputService {
  readOptionsOrFail<T extends z.ZodTypeAny>(mapCommand: (cmd: Command) => Command, schema: T): z.infer<T>;
}

const identity = <T>(v: T) => v;

export const IInputServiceKey = new SingleToken<IInputService>('IInputService');
export const readInput = <T extends z.ZodTypeAny>(schema: T, mapCommand: (cmd: Command) => Command = identity) =>
  IInputServiceKey.select((s) => s.readOptionsOrFail(mapCommand, schema));
