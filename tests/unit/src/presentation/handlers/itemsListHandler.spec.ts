import { ItemService } from '../../../../../src/application';
import { mockLogger } from '../../../../fixtures/mocks';
import { handler } from '../../../../../src/presentation/handlers/http/itemsListHandler';
import { handleError } from '../../../../../src/presentation/handlers/http/utils/handleError';
import { ok } from '../../../../../src/presentation/handlers/http/utils/response';

jest.mock('../../../../../src/presentation/handlers/http/utils/handleError', () => ({
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/presentation/handlers/http/utils/response', () => ({
  ok: jest.fn().mockImplementation((payload) => ({
    statusCode: 200,
    body: JSON.stringify(payload),
  })),
}));

describe('listItems handler', () => {
  const mockItemService = {
    listItems: jest.fn(),
  } as unknown as ItemService;

  const event = {
    queryStringParameters: { limit: '10', page: '2' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call listItems and return ok response', async () => {
    const items = [
      { id: 'item-1', name: 'One' },
      { id: 'item-2', name: 'Two' },
    ];
    (mockItemService.listItems as jest.Mock).mockResolvedValue(items);

    const response = await handler(mockLogger, mockItemService)(event as any);

    expect(mockLogger.info).toHaveBeenCalledWith('Received event for listing items.', { event });
    expect(mockItemService.listItems).toHaveBeenCalledWith(event.queryStringParameters);
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: 'Items retrieved successfully', items }),
    });
    expect(ok).toHaveBeenCalledWith({ message: 'Items retrieved successfully', items });
  });

  it('should log error and call handleError on failure', async () => {
    const error = new Error('DB unavailable');
    (mockItemService.listItems as jest.Mock).mockRejectedValue(error);

    await handler(mockLogger, mockItemService)(event as any);

    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred while retrieving or processing items.', { error });
    expect(handleError).toHaveBeenCalledWith(error);
  });
});
