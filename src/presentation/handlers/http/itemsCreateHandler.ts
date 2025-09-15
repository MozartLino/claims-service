import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ItemCreateEvent } from '../../utils/schemas/types';
import { ok } from './utils/response';
import { ItemService } from '../../../application';
import { handleError } from './utils/handleError';

export const handler =
  (logger: Logger, itemService: ItemService) =>
  async (event: ItemCreateEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info('Received event for creating item.', { event });

      const item = await itemService.createItem(event.body);

      return ok({ message: 'Item created successfully', item });
    } catch (error) {
      logger.error('Error occurred while creating or processing item.', { error });
      handleError(error);
    }
  };
