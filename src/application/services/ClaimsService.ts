import { Claim, DomainError, IClaimsRepository, ValidationError } from '../../domain';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { ClaimPrimitives } from '../../domain/models/types';
import { parse } from 'csv-parse/sync';
import { ClaimQueryApplicationFilters, ProcessClaimsResult, ProcessRecordResult } from '../models/ClaimsApplicationModel';
import { Logger } from '@aws-lambda-powertools/logger';

export class ClaimsService {
  constructor(
    private readonly claimsRepository: IClaimsRepository,
    private readonly logger: Logger,
  ) {}

  public async processClaims(csvContent: Buffer<ArrayBufferLike>): Promise<ProcessClaimsResult> {
    const records = this.parseCsv(csvContent);
    this.logger.info(`Parsed ${records.length} records from CSV content.`);

    const results = await Promise.all(records.map(this.processRecord));

    return this.summarizeResults(results);
  }

  async getClaimById(id: string): Promise<Claim> {
    const claim = await this.claimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Claim', id);
    }

    return claim;
  }

  async queryClaims(filters: ClaimQueryApplicationFilters): Promise<{
    claims: Claim[];
    totalAmount: number;
  }> {
    this.validateQueryFilters(filters);

    const claims = await this.claimsRepository.findByMemberAndDateRange({
      memberId: filters.memberId,
      startDate: new Date(filters.startDate),
      endDate: new Date(filters.endDate),
    });

    const sorted = this.sortByDateDesc(claims);
    const totalAmount = this.sumTotalAmount(sorted);

    return { claims: sorted, totalAmount };
  }

  private validateQueryFilters(filters: ClaimQueryApplicationFilters) {
    if (!filters.memberId) {
      throw ValidationError.forField('memberId', 'memberId is required for querying claims');
    }
    if (!filters.startDate || !filters.endDate) {
      throw ValidationError.forField('dateRange', 'Both startDate and endDate are required');
    }
    if (filters.startDate > filters.endDate) {
      throw ValidationError.forField('dateRange', 'startDate must be before endDate');
    }
  }

  private sortByDateDesc(claims: Claim[]): Claim[] {
    return claims.sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime());
  }

  private sumTotalAmount(claims: Claim[]): number {
    return claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
  }

  private parseCsv(csvContent: Buffer<ArrayBufferLike>): ClaimPrimitives[] {
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  private processRecord = async (row: ClaimPrimitives, index: number): Promise<ProcessRecordResult> => {
    try {
      const claim = Claim.fromCsvRow(row);
      await this.claimsRepository.save(claim);

      return { ok: true };
    } catch (err: unknown) {
      if (err instanceof DomainError) {
        return { ok: false, row: index + 1, message: err.message };
      }

      return { ok: false, row: index + 1, message: 'Unexpected error' };
    }
  };

  private summarizeResults(results: Array<{ ok: true } | { ok: false; row: number; message: string }>): ProcessClaimsResult {
    const errors = results.filter((r) => !r.ok) as { ok: false; row: number; message: string }[];
    const successCount = results.filter((r) => r.ok).length;

    return {
      successCount,
      errorCount: errors.length,
      errors: errors.map(({ row, message }) => ({ row, message })),
    };
  }
}
