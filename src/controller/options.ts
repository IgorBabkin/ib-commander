import { z } from 'zod';

export const BASIC_ARGS_SCHEMA = z.object({
  controller: z.string(),
  action: z.string().optional().default('default'),
});

export const isOption = (arg: string): boolean => arg.startsWith('-');
