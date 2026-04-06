import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsoleErrorHandler } from './ConsoleErrorHandler.js';

describe('ConsoleErrorHandler', () => {
  let handler: ConsoleErrorHandler;

  beforeEach(() => {
    handler = new ConsoleErrorHandler();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  it('logs the message of an Error instance', () => {
    handler.handleError(new Error('something went wrong'));
    expect(console.error).toHaveBeenCalledWith('Error: something went wrong');
  });

  it('logs the string representation of a non-Error value', () => {
    handler.handleError('just a string');
    expect(console.error).toHaveBeenCalledWith('Error: just a string');
  });

  it('exits with code 1', () => {
    handler.handleError(new Error('boom'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
