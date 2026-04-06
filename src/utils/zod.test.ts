import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { validateBySchema } from './zod.js';

const schema = z.object({ name: z.string(), age: z.number() });

describe('validateBySchema', () => {
  it('returns parsed data when input matches the schema', () => {
    const result = validateBySchema(schema)({ name: 'Alice', age: 30 });
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('throws when a required field is missing', () => {
    expect(() => validateBySchema(schema)({ name: 'Alice' })).toThrow();
  });

  it('throws when a field has the wrong type', () => {
    expect(() => validateBySchema(schema)({ name: 'Alice', age: 'thirty' })).toThrow();
  });
});
