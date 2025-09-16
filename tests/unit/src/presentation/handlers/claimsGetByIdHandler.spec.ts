import type { ClaimsService } from '../../../../../src/application';
import { mockLogger } from '../../../../fixtures/mocks';
import { handler } from '../../../../../src/presentation/handlers/http/claimsGetByIdHandler';
import { handleError } from '../../../../../src/presentation/handlers/http/utils/handleError';

jest.mock('../../../../../src/presentation/handlers/http/utils/handleError', () => ({
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/presentation/handlers/http/utils/response', () => ({
  ok: jest.fn().mockImplementation((claim) => ({
    statusCode: 200,
    body: JSON.stringify(claim),
  })),
}));

describe('claimsGetByIdHandler', () => {
  const mockClaimService = {
    getClaimById: jest.fn(),
  } as Partial<ClaimsService> as ClaimsService;

  const event = {
    pathParameters: {
      id: 'claim-123',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getClaimById and return ok response', async () => {
    const foundClaim = {
      id: 'claim-123',
      memberId: 'mbr-001',
      provider: 'Test Provider',
      serviceDate: new Date('2025-01-01'),
      totalAmount: 1500,
      diagnosisCodes: ['R51'],
    };

    (mockClaimService.getClaimById as jest.Mock).mockResolvedValue(foundClaim);

    const response = await handler(mockLogger, mockClaimService)(event as any);

    expect(mockClaimService.getClaimById).toHaveBeenCalledWith('claim-123');
    expect(response.statusCode).toEqual(200);
  });

  it('should log error and call handleError on failure', async () => {
    const error = new Error('DB down');
    (mockClaimService.getClaimById as jest.Mock).mockRejectedValue(error);

    await handler(mockLogger, mockClaimService)(event as any);

    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred while retrieving or processing claim.', { error });
    expect(handleError).toHaveBeenCalledWith(error);
  });
});
