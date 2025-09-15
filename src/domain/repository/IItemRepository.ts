import { Item } from '../models/Item';

export interface IItemRepository {
  save(item: Item): Promise<void>;
  findById(id: string): Promise<Item | undefined>;
  update(item: Item): Promise<Item>;
  delete(id: string): Promise<void>;
}
