import { z } from 'zod';
import { claimsGetByIdEventSchema, claimsIngestionEventSchema, claimsQueryEventSchema } from './ClaimSchemas';

export type ClaimsIngestionEvent = z.infer<typeof claimsIngestionEventSchema>;
export type ClaimsGetByIdEvent = z.infer<typeof claimsGetByIdEventSchema>;
export type ClaimsListEvent = z.infer<typeof claimsQueryEventSchema>;
