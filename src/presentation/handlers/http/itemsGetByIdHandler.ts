import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ItemGetByIdEvent } from '../../utils/schemas/types';
import { ok } from './utils/response';
import { ItemService } from '../../../application';
import { handleError } from './utils/handleError';

export const handler =
  (logger: Logger, itemService: ItemService) =>
  async (event: ItemGetByIdEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info('Received event for getting item by id.', { event });

      const item = await itemService.getItemById(event.pathParameters.id);

      logger.info('Item retrieved successfully.');

      return ok(item);
    } catch (error) {
      logger.error('Error occurred while retrieving or processing item.', { error });
      handleError(error);
    }
  };
