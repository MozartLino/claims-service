import { z } from 'zod';
import { itemCreateEventSchema, itemDeleteEventSchema, itemListEventSchema, itemUpdateEventSchema } from './itemsSchemas';

export type ItemCreateEvent = z.infer<typeof itemCreateEventSchema>;
export type ItemUpdateEvent = z.infer<typeof itemUpdateEventSchema>;
export type ItemDeleteEvent = z.infer<typeof itemDeleteEventSchema>;
export type ItemGetByIdEvent = z.infer<typeof itemDeleteEventSchema>;
export type ItemListEvent = z.infer<typeof itemListEventSchema>;
