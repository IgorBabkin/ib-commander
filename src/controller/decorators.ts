import { hook } from 'ts-ioc-container';
import { HookFn } from 'ts-ioc-container';

export const before = (...fns: HookFn[]) => hook('before-action', ...fns);
export const after = (...fns: HookFn[]) => hook('after-action', ...fns);
