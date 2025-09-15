import { ItemService } from '../../../../../src/application';
import { mockLogger } from '../../../../fixtures/mocks';
import { handler } from '../../../../../src/presentation/handlers/http/itemsDeleteHandler';
import { handleError } from '../../../../../src/presentation/handlers/http/utils/handleError';
import { noContent } from '../../../../../src/presentation/handlers/http/utils/response';

jest.mock('../../../../../src/presentation/handlers/http/utils/handleError', () => ({
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/presentation/handlers/http/utils/response', () => ({
  noContent: jest.fn().mockReturnValue({ statusCode: 204, body: '' }),
}));

describe('deleteItem handler', () => {
  const mockItemService = {
    deleteItem: jest.fn(),
  } as unknown as ItemService;

  const event = {
    pathParameters: {
      id: 'item-1',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call deleteItem and return noContent response', async () => {
    (mockItemService.deleteItem as jest.Mock).mockResolvedValue(undefined);

    const response = await handler(mockLogger, mockItemService)(event as any);

    expect(mockLogger.info).toHaveBeenCalledWith('Received event for deleting item.', { event });
    expect(mockItemService.deleteItem).toHaveBeenCalledWith('item-1');
    expect(mockLogger.info).toHaveBeenCalledWith('Item deleted successfully.');
    expect(response).toEqual({ statusCode: 204, body: '' });
    expect(noContent).toHaveBeenCalled();
  });

  it('should log error and call handleError on failure', async () => {
    const error = new Error('Delete failed');
    (mockItemService.deleteItem as jest.Mock).mockRejectedValue(error);

    await handler(mockLogger, mockItemService)(event as any);

    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred while delete or processing item.', { error });
    expect(handleError).toHaveBeenCalledWith(error);
  });
});
