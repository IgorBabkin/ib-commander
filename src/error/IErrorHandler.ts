import { SingleToken } from 'ts-ioc-container';

export interface IErrorHandler {
  handleError(err: unknown): void;
}

export const IErrorHandlerKey = new SingleToken<IErrorHandler>('IErrorHandler');
