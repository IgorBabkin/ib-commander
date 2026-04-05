import { ZodObject } from 'zod';

export const validateBySchema =
  <T extends ZodObject>(schema: T) =>
  (data: unknown) =>
    schema.parse(data);
