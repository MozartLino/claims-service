import { ItemService } from '../../../../../src/application';
import { mockLogger } from '../../../../fixtures/mocks';
import { handler } from '../../../../../src/presentation/handlers/http/itemsUpdateHandler';
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

describe('updateItem handler', () => {
  const mockItemService = {
    updateItem: jest.fn(),
  } as unknown as ItemService;

  const event = {
    pathParameters: { id: 'item-42' },
    body: { name: 'Updated Item' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call updateItem and return ok response', async () => {
    (mockItemService.updateItem as jest.Mock).mockResolvedValue(undefined);

    const response = await handler(mockLogger, mockItemService)(event as any);

    expect(mockLogger.info).toHaveBeenCalledWith('Received event for updating item.', { event });
    expect(mockItemService.updateItem).toHaveBeenCalledWith('item-42', { name: 'Updated Item' });
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: 'Item updated successfully', item: event }),
    });
    expect(ok).toHaveBeenCalledWith({ message: 'Item updated successfully', item: event });
  });

  it('should log error and call handleError on failure', async () => {
    const error = new Error('Update failed');
    (mockItemService.updateItem as jest.Mock).mockRejectedValue(error);

    await handler(mockLogger, mockItemService)(event as any);

    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred while updating or processing items.', { error });
    expect(handleError).toHaveBeenCalledWith(error);
  });
});
