/* istanbul ignore file */
import { z } from 'zod';

export const pathIdSchema = z.object({ id: z.string().min(1) });

export const listQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  cursor: z.string().optional(),
});

export const createBodySchema = z.object({
  name: z.string().min(1),
});

export const updateBodySchema = z.object({
  name: z.string().min(1),
});

export const itemCreateEventSchema = z
  .object({
    body: createBodySchema.passthrough(),
  })
  .passthrough();

export const itemUpdateEventSchema = z
  .object({
    pathParameters: z.object({
      id: z.string(),
    }),
    body: updateBodySchema.passthrough(),
  })
  .passthrough();

export const itemDeleteEventSchema = z
  .object({
    pathParameters: z.object({
      id: z.string(),
    }),
  })
  .passthrough();

export const itemGetByIdEventSchema = z
  .object({
    pathParameters: z.object({
      id: z.string(),
    }),
  })
  .passthrough();

export const itemListEventSchema = z
  .object({
    queryStringParameters: listQuerySchema.passthrough(),
  })
  .passthrough();
