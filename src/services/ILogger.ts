import { SingleToken } from 'ts-ioc-container';

export interface ILogger {
  info(...messages: string[]): void;
  error(...messages: string[]): void;
}

export const ILoggerKey = new SingleToken<ILogger>('ILogger');
