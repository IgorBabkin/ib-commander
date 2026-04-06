import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ShellInputService } from './ShellInputService.js';

const BASIC_SCHEMA = z.object({
  controller: z.string(),
  action: z.string().optional().default('default'),
});

function makeService(args: string[]) {
  return new ShellInputService(args);
}

describe('ShellInputService', () => {
  describe('readOptionsOrFail', () => {
    it('parses controller and action from positional operands', () => {
      const result = makeService(['ib', 'changelog', 'generate']).readOptionsOrFail((cmd) => cmd, BASIC_SCHEMA);
      expect(result).toMatchObject({ controller: 'changelog', action: 'generate' });
    });

    it('defaults action to "default" when not provided', () => {
      const result = makeService(['ib', 'changelog']).readOptionsOrFail((cmd) => cmd, BASIC_SCHEMA);
      expect(result).toMatchObject({ controller: 'changelog', action: 'default' });
    });

    it('parses named options defined by mapCommand', () => {
      const schema = BASIC_SCHEMA.extend({ greeting: z.string() });
      const result = makeService(['ib', 'changelog', 'generate', '--greeting', 'hello']).readOptionsOrFail((cmd) => cmd.option('--greeting <value>'), schema);
      expect(result.greeting).toBe('hello');
    });

    it('throws when parsed data does not satisfy the schema', () => {
      const schema = z.object({ controller: z.string(), required: z.string() });
      expect(() => makeService(['ib', 'changelog']).readOptionsOrFail((cmd) => cmd, schema)).toThrow();
    });
  });
});
