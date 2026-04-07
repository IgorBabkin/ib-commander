import { ZodObject } from 'zod';
import { getMethodMeta, methodMeta } from 'ts-ioc-container';

export const validateBySchema =
  <T extends ZodObject>(schema: T) =>
  (data: unknown) =>
    schema.parse(data);

export const schema = <T extends ZodObject>(schema: T) => methodMeta('schema', () => schema);
export const getSchemaOrFail = (target: object, propertyKey: string) => {
  const value = getMethodMeta('schema', target, propertyKey) as ZodObject | undefined;
  if (!value) {
    throw new Error(`${propertyKey} is not a valid schema`);
  }
  return value;
};
