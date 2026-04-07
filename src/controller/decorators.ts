import { getMethodMeta, hook, HooksRunner, IContainer, methodMeta } from 'ts-ioc-container';
import { HookFn } from 'ts-ioc-container';
import { ZodObject } from 'zod';
import { Command } from 'commander';

export const onBefore = (...fns: HookFn[]) => hook('before', ...fns);
export const createOnBeforeHookRunner = () => new HooksRunner('before');

export const onAfter = (...fns: HookFn[]) => hook('after', ...fns);
export const createOnAfterHookRunner = () => new HooksRunner('after');

export const onError = (...fns: HookFn[]) => hook('error', ...fns);
export const createOnErrorHookRunner = () => new HooksRunner('error');

export const onDefault = (...fns: HookFn[]) => hook('default', ...fns);

export const schema = <T extends ZodObject>(value: (c: IContainer) => T) => methodMeta('schema', () => value);
export const getSchema = (target: object, propertyKey: string) => {
  return getMethodMeta('schema', target, propertyKey as string) as ((c: IContainer) => ZodObject) | undefined;
};

export const command = (createCmd: (c: IContainer) => Command) => methodMeta('command', () => createCmd);
export const getCommand = (instance: object, methodName: string) => {
  return getMethodMeta('command', instance, methodName) as ((c: IContainer) => Command) | undefined;
};
