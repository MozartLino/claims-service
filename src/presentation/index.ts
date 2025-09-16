import configFromEnv from '../infrastructure/config/configFromEnv';
import { createClient } from '../infrastructure/repositories/dynamodb/client';
import { ClaimsService } from '../application';
import { ClaimsRepository } from '../infrastructure/repositories/dynamodb/ClaimsRepository';
import { defaultMiddleware } from './middlewares/defaultMiddyConfiguration';
import { claimsGetByIdEventSchema, claimsIngestionEventSchema, claimsQueryEventSchema } from './utils/schemas/ClaimSchemas';
import { handler as ingestionClaimsHandlerFn } from './handlers/http/ingestionClaimsHandler';
import { handler as getClaimByIdHandlerFn } from './handlers/http/claimsGetByIdHandler';
import { handler as listClaimsHandlerFn } from './handlers/http/listClaimsHandler';
import { logger } from './utils/logger';
import { ClaimsGetByIdEvent, ClaimsIngestionEvent, ClaimsListEvent } from './utils/schemas/types';

const config = configFromEnv();
const dynamoDBClient = createClient(config);
const claimsRepository = new ClaimsRepository(dynamoDBClient, config, logger);
const claimsService = new ClaimsService(claimsRepository, logger);

const ingestionOptions = { schema: claimsIngestionEventSchema, enableJsonParser: false, enableMultipartParser: true };
export const ingestionClaimsHandler = defaultMiddleware<ClaimsIngestionEvent>(logger)(ingestionOptions).handler(
  ingestionClaimsHandlerFn(logger, claimsService),
);

export const getClaimByIdHandler = defaultMiddleware<ClaimsGetByIdEvent>(logger)({ schema: claimsGetByIdEventSchema }).handler(
  getClaimByIdHandlerFn(logger, claimsService),
);

export const listClaimsHandler = defaultMiddleware<ClaimsListEvent>(logger)({ schema: claimsQueryEventSchema }).handler(
  listClaimsHandlerFn(logger, claimsService),
);
