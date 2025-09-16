import { Claim } from '../models/Claim';

export interface PaginatedListParams {
  limit?: number;
  cursor?: string;
}

export interface PaginatedListResult {
  items: Claim[];
  cursor?: string;
}

export interface IPaginatedItemRepository {
  list(params: PaginatedListParams): Promise<PaginatedListResult>;
}
