import { ClaimsService } from '../../../../../src/application';
import { mockLogger } from '../../../../fixtures/mocks';
import { handler } from '../../../../../src/presentation/handlers/http/ingestionClaimsHandler';
import { ok } from '../../../../../src/presentation/handlers/http/utils/response';
import { handleError } from '../../../../../src/presentation/handlers/http/utils/handleError';

jest.mock('../../../../../src/presentation/handlers/http/utils/handleError', () => ({
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/presentation/handlers/http/utils/response', () => ({
  ok: jest.fn().mockReturnValue({ statusCode: 200, body: 'OK' }),
}));

describe('ingestionClaimsHandler', () => {
  const mockClaimsService = {
    processClaims: jest.fn(),
  } as unknown as ClaimsService;

  const event = {
    body: {
      file: {
        content: Buffer.from('csv-content'),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call processClaims and return ok response', async () => {
    const mockResult = { successCount: 1, errorCount: 0, errors: [] };
    (mockClaimsService.processClaims as jest.Mock).mockResolvedValue(mockResult);

    const response = await handler(mockLogger, mockClaimsService)(event as any);

    expect(mockClaimsService.processClaims).toHaveBeenCalledWith(event.body.file.content);
    expect(response).toEqual({ statusCode: 200, body: 'OK' });
    expect(ok).toHaveBeenCalledWith({
      message: 'File processed successfully',
      response: mockResult,
    });
  });

  it('should log error and call handleError on failure', async () => {
    const error = new Error('Boom!');
    (mockClaimsService.processClaims as jest.Mock).mockRejectedValue(error);

    await expect(handler(mockLogger, mockClaimsService)(event as any)).resolves.toBeUndefined();

    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred while creating or processing item.', { error });
    expect(handleError).toHaveBeenCalledWith(error);
  });
});
