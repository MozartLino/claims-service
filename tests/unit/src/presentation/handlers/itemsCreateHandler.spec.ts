import { ItemService } from '../../../../../src/application';
import { mockLogger } from '../../../../fixtures/mocks';
import { handler } from '../../../../../src/presentation/handlers/http/itemsCreateHandler';

jest.mock('../../../../../src/presentation/handlers/http/utils/handleError', () => ({
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/presentation/handlers/http/utils/response', () => ({
  ok: jest.fn().mockReturnValue({ statusCode: 200, body: 'OK' }),
}));

describe('createItem handler', () => {
  const mockItemService = {
    createItem: jest.fn(),
  } as unknown as ItemService;

  const event = {
    body: {
      name: 'Test item',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call createItem and return ok response', async () => {
    const createdItem = { id: 'item-1', name: 'Test item' };
    (mockItemService.createItem as jest.Mock).mockResolvedValue(createdItem);
    const response = await handler(mockLogger, mockItemService)(event);

    expect(mockLogger.info).toHaveBeenCalledWith('Received event for creating item.', { event });
    expect(mockItemService.createItem).toHaveBeenCalledWith(event.body);
    expect(response).toEqual({ statusCode: 200, body: 'OK' });
  });

  it('should log error and call handleError on failure', async () => {
    const error = new Error('Boom!');
    (mockItemService.createItem as jest.Mock).mockRejectedValue(error);

    await expect(handler(mockLogger, mockItemService)(event)).resolves.toBeUndefined();

    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred while creating or processing item.', { error });
  });
});
