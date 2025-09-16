import { Claim } from '../models/Claim';

export interface ClaimQueryFilters {
  memberId: string;
  startDate: Date;
  endDate: Date;
}

export interface IClaimsRepository {
  save(claims: Claim): void;
  findById(id: string): Promise<Claim | undefined>;
  findByMemberAndDateRange(filters: ClaimQueryFilters): Promise<Claim[]>;
}
