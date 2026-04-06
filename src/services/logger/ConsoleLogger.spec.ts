import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsoleLogger } from './ConsoleLogger.js';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('info writes to console.log', () => {
    logger.info('hello', 'world');
    expect(console.log).toHaveBeenCalledWith('hello', 'world');
  });

  it('error writes to console.error', () => {
    logger.error('something', 'failed');
    expect(console.error).toHaveBeenCalledWith('something', 'failed');
  });
});
