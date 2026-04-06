import { hook, HooksRunner } from 'ts-ioc-container';
import { HookFn } from 'ts-ioc-container';

export const onBefore = (...fns: HookFn[]) => hook('before', ...fns);
export const onAfter = (...fns: HookFn[]) => hook('after', ...fns);
export const onError = (...fns: HookFn[]) => hook('error', ...fns);
export const onDefault = (...fns: HookFn[]) => hook('default', ...fns);

export const createOnBeforeHookRunner = () => new HooksRunner('before');
export const createOnAfterHookRunner = () => new HooksRunner('after');
export const createOnErrorHookRunner = () => new HooksRunner('error');
