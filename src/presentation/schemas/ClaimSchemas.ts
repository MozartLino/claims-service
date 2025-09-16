/* istanbul ignore file */
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024;

export const pathIdSchema = z.object({ id: z.string().min(1) });

export const claimsIngestionEventSchema = z
  .object({
    body: z
      .object({
        file: z.object({
          filename: z.string().min(1, 'Filename is required.'),
          mimetype: z.string().regex(/^text\/csv$/, 'File must be a CSV.'),
          encoding: z.string(),
          truncated: z.boolean(),
          content: z
            .instanceof(Buffer)
            .refine((buffer) => buffer.length > 0, { message: 'File content is required.' })
            .refine((buffer) => buffer.length <= MAX_FILE_SIZE, {
              message: `File must not exceed ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
            }),
        }),
      })
      .passthrough(),
  })
  .passthrough();

export const claimsGetByIdEventSchema = z
  .object({
    pathParameters: z.object({
      id: z.string(),
    }),
  })
  .passthrough();

export const claimsQueryEventSchema = z
  .object({
    queryStringParameters: z.object({
      memberId: z.string().min(1, 'memberId is required'),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD format'),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD format'),
    }),
  })
  .passthrough();
