import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ItemUpdateEvent } from '../../utils/schemas/types';
import { ok } from './utils/response';
import { ItemService } from '../../../application';
import { handleError } from './utils/handleError';

export const handler =
  (logger: Logger, itemService: ItemService) =>
  async (event: ItemUpdateEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info('Received event for updating item.', { event });

      await itemService.updateItem(event.pathParameters.id, event.body);

      return ok({ message: 'Item updated successfully', item: event });
    } catch (error) {
      logger.error('Error occurred while updating or processing items.', { error });
      handleError(error);
    }
  };
