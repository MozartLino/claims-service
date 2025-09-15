import { IItemRepository, Item, IdGenerator } from '../../domain';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { IPaginatedItemRepository, PaginatedListParams, PaginatedListResult } from '../../domain/repository/IPaginatedItemRepository';
import { ItemApplicationModel } from '../models/ItemApplicationModel';

export class ItemService {
  constructor(
    private readonly itemRepository: IItemRepository,
    private readonly paginationRepository: IPaginatedItemRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async createItem(input: ItemApplicationModel): Promise<void> {
    const item = Item.create({
      id: this.idGenerator.generate(),
      name: input.name,
      createdAt: new Date(),
    });

    await this.itemRepository.save(item);
  }

  async getItemById(id: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);

    if (!item) {
      throw new NotFoundError('Item', id);
    }

    return item;
  }

  async updateItem(id: string, itemAppModel: ItemApplicationModel): Promise<void> {
    const existingItem = await this.getItemById(id);
    const newItem = existingItem.rename(itemAppModel.name);

    await this.itemRepository.update(newItem);
  }

  async deleteItem(id: string): Promise<void> {
    await this.itemRepository.delete(id);
  }

  async listItems(paginatedListParams: PaginatedListParams): Promise<PaginatedListResult> {
    return await this.paginationRepository.list(paginatedListParams);
  }
}
