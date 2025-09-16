import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ok } from './utils/response';
import { ClaimsService } from '../../../application';
import { handleError } from './utils/handleError';
import { ClaimsGetByIdEvent } from '../../utils/schemas/types';
import { ClaimViewModel } from '../../utils/model/ClaimViewModel';

export const handler =
  (logger: Logger, claimService: ClaimsService) =>
  async (event: ClaimsGetByIdEvent): Promise<APIGatewayProxyResult> => {
    try {
      const claim = await claimService.getClaimById(event.pathParameters.id);

      return ok(ClaimViewModel.fromDomain(claim));
    } catch (error) {
      logger.error('Error occurred while retrieving or processing claim.', { error });
      handleError(error);
    }
  };
