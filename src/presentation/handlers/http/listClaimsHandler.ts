import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ok } from './utils/response';
import { ClaimsService } from '../../../application';
import { handleError } from './utils/handleError';
import { ClaimsListEvent } from '../../utils/schemas/types';

export const handler =
  (logger: Logger, claimService: ClaimsService) =>
  async (event: ClaimsListEvent): Promise<APIGatewayProxyResult> => {
    try {
      const claims = await claimService.queryClaims(event.queryStringParameters);

      return ok({ claims });
    } catch (error) {
      logger.error('Error occurred while retrieving or processing items.', { error });
      handleError(error);
    }
  };
