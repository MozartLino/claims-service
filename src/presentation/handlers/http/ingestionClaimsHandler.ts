import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ClaimsService } from '../../../application';
import { handleError } from './utils/handleError';
import { ClaimsIngestionEvent } from '../../schemas/types';
import { ok } from './utils/response';

export const handler =
  (logger: Logger, claimsService: ClaimsService) =>
  async (event: ClaimsIngestionEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { file } = event.body;
      const response = await claimsService.processClaims(file.content);

      return ok({ message: 'File processed successfully', response });
    } catch (error) {
      logger.error('Error occurred while creating or processing item.', { error });
      handleError(error);
    }
  };
