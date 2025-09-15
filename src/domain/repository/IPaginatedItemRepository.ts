import { Item } from '../models/Item';

export interface PaginatedListParams {
  limit?: number;
  cursor?: string;
}

export interface PaginatedListResult {
  items: Item[];
  cursor?: string;
}

export interface IPaginatedItemRepository {
  list(params: PaginatedListParams): Promise<PaginatedListResult>;
}
