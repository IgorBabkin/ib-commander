import { z } from 'zod';

export const BASIC_OPTION_SCHEMA = z.object({
  controller: z.string(),
  action: z.string().optional().default('default'),
});

export type BasicOptionSchema = z.infer<typeof BASIC_OPTION_SCHEMA>;
