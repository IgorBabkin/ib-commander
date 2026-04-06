import { hook } from 'ts-ioc-container';
import { HookFn } from 'ts-ioc-container';

export const before = (...fns: HookFn[]) => hook('before', ...fns);
export const after = (...fns: HookFn[]) => hook('after', ...fns);
export const error = (...fns: HookFn[]) => hook('error', ...fns);
