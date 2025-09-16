import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ok } from './utils/response';
import { ClaimsService } from '../../../application';
import { handleError } from './utils/handleError';
import { ClaimsListEvent } from '../../schemas/types';
import { ClaimViewModel } from '../../utils/model/ClaimViewModel';
import { formatCurrency } from '../../utils/formatCurrency';

export const handler =
  (logger: Logger, claimService: ClaimsService) =>
  async (event: ClaimsListEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { claims, totalAmount } = await claimService.queryClaims(event.queryStringParameters);

      const viewModel = {
        claims: claims.map((c) => ClaimViewModel.fromDomain(c)),
        totalAmount,
        formattedTotalAmount: formatCurrency(totalAmount),
      };

      return ok(viewModel);
    } catch (error) {
      logger.error('Error occurred while retrieving or processing items.', { error });
      handleError(error);
    }
  };
