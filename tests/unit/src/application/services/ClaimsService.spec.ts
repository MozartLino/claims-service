import { ClaimsService } from '../../../../../src/application/services/ClaimsService';
import { Claim } from '../../../../../src/domain';
import { NotFoundError } from '../../../../../src/domain/errors/NotFoundError';
import { ValidationError } from '../../../../../src/domain/errors/ValidationError';
import { mockLogger, mockRepo } from '../../../../fixtures/mocks';

describe('ClaimsService', () => {
  const service = new ClaimsService(mockRepo, mockLogger);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClaimById', () => {
    it('should throw NotFoundError when claim is not found', async () => {
      mockRepo.findById.mockResolvedValue(undefined);

      await expect(service.getClaimById('invalid-id')).rejects.toThrow(NotFoundError);
    });

    it('should return claim when found', async () => {
      const fakeClaim = Claim.create({
        id: 'clm-123',
        memberId: 'mbr-001',
        provider: 'Test Provider',
        serviceDate: new Date(),
        totalAmount: 1000,
      });

      mockRepo.findById.mockResolvedValue(fakeClaim);

      const claim = await service.getClaimById('clm-123');
      expect(claim.id).toBe('clm-123');
    });
  });

  describe('queryClaims', () => {
    it('should throw ValidationError if memberId is missing', async () => {
      await expect(service.queryClaims({ startDate: '2025-01-01', endDate: '2025-01-10' } as any)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if startDate or endDate is missing', async () => {
      await expect(service.queryClaims({ memberId: 'm1', startDate: '2025-01-01' } as any)).rejects.toThrow(ValidationError);

      await expect(service.queryClaims({ memberId: 'm1', endDate: '2025-01-10' } as any)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if startDate is after endDate', async () => {
      await expect(
        service.queryClaims({
          memberId: 'm1',
          startDate: '2025-02-01',
          endDate: '2025-01-01',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('should return sorted claims and total amount', async () => {
      const claim1 = Claim.create({
        id: 'c1',
        memberId: 'm1',
        provider: 'Provider1',
        serviceDate: new Date('2025-01-05'),
        totalAmount: 5000,
      });

      const claim2 = Claim.create({
        id: 'c2',
        memberId: 'm1',
        provider: 'Provider2',
        serviceDate: new Date('2025-01-10'),
        totalAmount: 7000,
      });

      mockRepo.findByMemberAndDateRange.mockResolvedValue([claim1, claim2]);

      const result = await service.queryClaims({
        memberId: 'm1',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      expect(result.claims[0].id).toBe('c2');
      expect(result.totalAmount).toBe(12000);
    });
  });

  describe('processClaims', () => {
    it('should save valid claims and summarize results', async () => {
      const csv = Buffer.from(
        `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
        C1,M1,Provider,2025-01-10,1000,R51`,
      );

      mockRepo.save.mockResolvedValue(undefined);

      const result = await service.processClaims(csv);

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });

    it('should report errors for invalid claims', async () => {
      const csv = Buffer.from(
        `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
        ,M1,Provider,2025-01-10,1000,R51`,
      );

      const result = await service.processClaims(csv);

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].message).toContain('Missing claimId');
    });

    it('should return { ok: false, message: "Unexpected error" } when a non-DomainError is thrown', async () => {
      mockRepo.save.mockRejectedValueOnce(new Error('DB down'));

      const result = await service.processClaims(
        Buffer.from(
          `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
        clm-err,mbr-err,Provider,2025-01-01,1000,`,
        ),
      );

      expect(result.errorCount).toBe(1);
      expect(result.errors[0]).toEqual({
        row: 1,
        message: 'Unexpected error',
      });
    });
  });
});
