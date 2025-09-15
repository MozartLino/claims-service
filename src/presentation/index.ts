import configFromEnv from '../infrastructure/config/configFromEnv';
import { createClient } from '../infrastructure/repositories/dynamodb/client';
import { ItemService } from '../application';
import { ItemRepository } from '../infrastructure/repositories/dynamodb/ItemRepository';
import { CryptoUuidGenerator } from '../infrastructure/utils/CryptoUuidGenerator';
import { defaultMiddleware } from './middlewares/defaultMiddyConfiguration';
import { ItemCreateEvent, ItemDeleteEvent, ItemGetByIdEvent, ItemListEvent, ItemUpdateEvent } from './utils/schemas/types';
import {
  itemCreateEventSchema,
  itemDeleteEventSchema,
  itemGetByIdEventSchema,
  itemListEventSchema,
  itemUpdateEventSchema,
} from './utils/schemas/itemsSchemas';
import { handler as createItemHandlerFn } from './handlers/http/itemsCreateHandler';
import { handler as updateItemHandlerFn } from './handlers/http/itemsUpdateHandler';
import { handler as deleteItemHandlerFn } from './handlers/http/itemsDeleteHandler';
import { handler as listItemHandlerFn } from './handlers/http/itemsListHandler';
import { handler as getItemByIdHandlerFn } from './handlers/http/itemsGetByIdHandler';
import { logger } from './utils/logger';

const config = configFromEnv();
const dynamoDBClient = createClient(config);
const itemRepository = new ItemRepository(dynamoDBClient, config, logger);
const idGenerator = new CryptoUuidGenerator();
const itemService = new ItemService(itemRepository, itemRepository, idGenerator);

export const createItemHandler = defaultMiddleware<ItemCreateEvent>(logger)(itemCreateEventSchema).handler(
  createItemHandlerFn(logger, itemService),
);
export const getItemByIdHandler = defaultMiddleware<ItemGetByIdEvent>(logger)(itemGetByIdEventSchema).handler(
  getItemByIdHandlerFn(logger, itemService),
);
export const deleteItemHandler = defaultMiddleware<ItemDeleteEvent>(logger)(itemDeleteEventSchema).handler(
  deleteItemHandlerFn(logger, itemService),
);
export const updateItemHandler = defaultMiddleware<ItemUpdateEvent>(logger)(itemUpdateEventSchema).handler(
  updateItemHandlerFn(logger, itemService),
);
export const listItemHandler = defaultMiddleware<ItemListEvent>(logger)(itemListEventSchema).handler(
  listItemHandlerFn(logger, itemService),
);
