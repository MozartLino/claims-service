import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ItemListEvent } from '../../utils/schemas/types';
import { ok } from './utils/response';
import { ItemService } from '../../../application';
import { handleError } from './utils/handleError';

export const handler =
  (logger: Logger, itemService: ItemService) =>
  async (event: ItemListEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info('Received event for listing items.', { event });

      const items = await itemService.listItems(event.queryStringParameters);

      return ok({ message: 'Items retrieved successfully', items });
    } catch (error) {
      logger.error('Error occurred while retrieving or processing items.', { error });
      handleError(error);
    }
  };
