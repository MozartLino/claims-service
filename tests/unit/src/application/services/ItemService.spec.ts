import { ItemService } from '../../../../../src/application';
import { Item } from '../../../../../src/domain';
import { NotFoundError } from '../../../../../src/domain/errors/NotFoundError';
import { mockIdGenerator, mockPaginationRepo, mockRepo } from '../../../../fixtures/mocks';

describe('ItemService', () => {
  const service: ItemService = new ItemService(mockRepo, mockPaginationRepo, mockIdGenerator);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an item and call repository.save()', async () => {
    await service.createItem({ name: 'Test Item' });

    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'uuid-123',
        name: 'Test Item',
        createdAt: expect.any(Date),
      }),
    );
  });

  it('should throw NotFoundError when item is not found by ID', async () => {
    mockRepo.findById.mockResolvedValue(undefined);

    await expect(service.getItemById('invalid-id')).rejects.toThrow(NotFoundError);
  });

  it('should return item when found by ID', async () => {
    const fakeItem = Item.create({
      id: 'item-123',
      name: 'Item',
      createdAt: new Date(),
    });

    mockRepo.findById.mockResolvedValue(fakeItem);

    const item = await service.getItemById('item-123');
    expect(item.name).toBe('Item');
  });

  it('should update an existing item with new name', async () => {
    const existingItem = Item.create({
      id: 'item-123',
      name: 'Old Name',
      createdAt: new Date(),
    });

    mockRepo.findById.mockResolvedValue(existingItem);

    await service.updateItem('item-123', { name: 'New Name' });

    expect(mockRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'item-123',
        name: 'New Name',
        createdAt: expect.any(Date),
      }),
    );
  });

  it('should delete item by id', async () => {
    await service.deleteItem('item-123');
    expect(mockRepo.delete).toHaveBeenCalledWith('item-123');
  });

  it('should list items using paginationRepository', async () => {
    const mockPaginatedResult = { items: [], nextToken: null };
    mockPaginationRepo.list.mockResolvedValue(mockPaginatedResult);

    const result = await service.listItems({ limit: 10 });

    expect(mockPaginationRepo.list).toHaveBeenCalledWith({ limit: 10 });
    expect(result).toEqual(mockPaginatedResult);
  });
});
