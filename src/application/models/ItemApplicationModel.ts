import { Item } from '../../domain';

export type ItemApplicationModel = {
  id?: string;
  name: string;
  createdAt?: string;
};

export interface ListItemsParams {
  limit?: number;
  cursor?: string;
}

export interface ListItemsResult {
  items: Item[];
  cursor?: string;
}
