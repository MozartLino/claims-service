import type { ItemService } from '../../../../../src/application';
import { mockLogger } from '../../../../fixtures/mocks';
import { handler } from '../../../../../src/presentation/handlers/http/itemsGetByIdHandler';
import { handleError } from '../../../../../src/presentation/handlers/http/utils/handleError';
import { ok } from '../../../../../src/presentation/handlers/http/utils/response';

jest.mock('../../../../../src/presentation/handlers/http/utils/handleError', () => ({
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/presentation/handlers/http/utils/response', () => ({
  ok: jest.fn().mockImplementation((item) => ({
    statusCode: 200,
    body: JSON.stringify(item),
  })),
}));

describe('getItemById handler', () => {
  const mockItemService = {
    getItemById: jest.fn(),
  } as Partial<ItemService> as ItemService;

  const event = {
    pathParameters: {
      id: 'item-123',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getItemById and return ok response', async () => {
    const foundItem = { id: 'item-123', name: 'My item' };
    (mockItemService.getItemById as jest.Mock).mockResolvedValue(foundItem);

    const response = await handler(mockLogger, mockItemService)(event as any);

    expect(mockLogger.info).toHaveBeenCalledWith('Received event for getting item by id.', { event });
    expect(mockItemService.getItemById).toHaveBeenCalledWith('item-123');
    expect(mockLogger.info).toHaveBeenCalledWith('Item retrieved successfully.');
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify(foundItem),
    });
    expect(ok).toHaveBeenCalledWith(foundItem);
  });

  it('should log error and call handleError on failure', async () => {
    const error = new Error('DB down');
    (mockItemService.getItemById as jest.Mock).mockRejectedValue(error);

    await handler(mockLogger, mockItemService)(event as any);

    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred while retrieving or processing item.', { error });
    expect(handleError).toHaveBeenCalledWith(error);
  });
});
