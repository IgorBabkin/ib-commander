import { bindTo, register, singleton } from 'ts-ioc-container';
import { IErrorHandler, IErrorHandlerKey } from './IErrorHandler';

@register(bindTo(IErrorHandlerKey), singleton())
export class ConsoleErrorHandler implements IErrorHandler {
  handleError(err: unknown): void {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
