import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ItemDeleteEvent } from '../../utils/schemas/types';
import { noContent } from './utils/response';
import { ItemService } from '../../../application';
import { handleError } from './utils/handleError';

export const handler =
  (logger: Logger, itemService: ItemService) =>
  async (event: ItemDeleteEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info('Received event for deleting item.', { event });

      await itemService.deleteItem(event.pathParameters.id);

      logger.info('Item deleted successfully.');

      return noContent();
    } catch (error) {
      logger.error('Error occurred while delete or processing item.', { error });
      handleError(error);
    }
  };
