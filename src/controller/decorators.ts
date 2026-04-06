import { hook, HooksRunner } from 'ts-ioc-container';
import { HookFn } from 'ts-ioc-container';

export const onBefore = (...fns: HookFn[]) => hook('before', ...fns);
export const createOnBeforeHookRunner = () => new HooksRunner('before');

export const onAfter = (...fns: HookFn[]) => hook('after', ...fns);
export const createOnAfterHookRunner = () => new HooksRunner('after');

export const onError = (...fns: HookFn[]) => hook('error', ...fns);
export const createOnErrorHookRunner = () => new HooksRunner('error');

export const onDefault = (...fns: HookFn[]) => hook('default', ...fns);
