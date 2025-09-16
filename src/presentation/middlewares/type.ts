import z from 'zod';

export type MiddlewareOptions = {
  schema: z.AnyZodObject;
  enableJsonParser?: boolean;
  enableMultipartParser?: boolean;
};
