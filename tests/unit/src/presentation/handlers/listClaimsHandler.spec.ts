import { ClaimsService } from '../../../../../src/application';
import { mockClaims, mockLogger } from '../../../../fixtures/mocks';
import { handler } from '../../../../../src/presentation/handlers/http/listClaimsHandler';
import { ok } from '../../../../../src/presentation/handlers/http/utils/response';
import { handleError } from '../../../../../src/presentation/handlers/http/utils/handleError';

jest.mock('../../../../../src/presentation/handlers/http/utils/handleError', () => ({
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/presentation/handlers/http/utils/response', () => ({
  ok: jest.fn().mockReturnValue({ statusCode: 200, body: 'OK' }),
}));

describe('listClaimsHandler', () => {
  const mockClaimsService = {
    queryClaims: jest.fn(),
  } as unknown as ClaimsService;

  const event = {
    queryStringParameters: {
      memberId: 'mbr-1',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call queryClaims and return ok response', async () => {
    const claims = { claims: mockClaims, totalAmount: 2500 };
    (mockClaimsService.queryClaims as jest.Mock).mockResolvedValue(claims);

    const response = await handler(mockLogger, mockClaimsService)(event as any);

    expect(mockClaimsService.queryClaims).toHaveBeenCalledWith(event.queryStringParameters);
    expect(response).toEqual({ statusCode: 200, body: 'OK' });
    expect(ok).toHaveBeenCalledWith({
      claims: [
        {
          claimId: 'clm-1',
          memberId: 'mbr-1',
          serviceDate: '2025-01-15T00:00:00.000Z',
          serviceDateEST: '01/14/2025, 07:00:00 PM',
          formattedTotalAmount: '$NaN',
        },
        {
          claimId: 'clm-2',
          memberId: 'mbr-1',
          serviceDate: '2025-01-20T00:00:00.000Z',
          serviceDateEST: '01/19/2025, 07:00:00 PM',
          formattedTotalAmount: '$NaN',
        },
      ],
      totalAmount: 2500,
      formattedTotalAmount: '$25.00',
    });
  });

  it('should log error and call handleError on failure', async () => {
    const error = new Error('Boom!');
    (mockClaimsService.queryClaims as jest.Mock).mockRejectedValue(error);

    await expect(handler(mockLogger, mockClaimsService)(event as any)).resolves.toBeUndefined();

    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred while retrieving or processing items.', { error });
    expect(handleError).toHaveBeenCalledWith(error);
  });
});
