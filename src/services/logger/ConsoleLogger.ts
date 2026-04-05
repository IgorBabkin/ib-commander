import { bindTo, register, singleton } from 'ts-ioc-container';
import { ILogger, ILoggerKey } from './ILogger.js';

@register(bindTo(ILoggerKey), singleton())
export class ConsoleLogger implements ILogger {
  info(...messages: string[]): void {
    console.log(...messages);
  }

  error(...messages: string[]): void {
    console.error(...messages);
  }
}
