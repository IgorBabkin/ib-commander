import { HookFn } from 'ts-ioc-container';

export const execute = (): HookFn => (c) => {
  c.invokeMethod();
};
