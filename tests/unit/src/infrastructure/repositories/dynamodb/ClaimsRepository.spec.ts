import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { ClaimsRepository } from '../../../../../../src/infrastructure/repositories/dynamodb/ClaimsRepository';
import { mockConfig, mockLogger } from '../../../../../fixtures/mocks';
import { ConditionalCheckFailedException, DynamoDBClient, ResourceNotFoundException, ThrottlingException } from '@aws-sdk/client-dynamodb';
import { Claim } from '../../../../../../src/domain';
import { InfraError } from '../../../../../../src/domain/errors/InfraError';
import { ValidationError } from '../../../../../../src/domain/errors/ValidationError';
import { AccessDeniedException } from '@aws-sdk/client-ssm';

describe('ClaimsRepository', () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  const dynamodb = new DynamoDBClient({});
  const ddb = DynamoDBDocumentClient.from(dynamodb);
  const repository = new ClaimsRepository(ddb, mockConfig, mockLogger);

  beforeEach(() => {
    jest.clearAllMocks();
    ddbMock.reset();
  });

  describe('save', () => {
    it('should send PutCommand to DynamoDB with correct item', async () => {
      const claim = Claim.create({
        id: 'clm-1',
        memberId: 'mbr-1',
        provider: 'Provider Test',
        serviceDate: new Date('2025-01-01'),
        totalAmount: 1000,
        diagnosisCodes: ['R51'],
      });

      await repository.save(claim);

      expect(ddbMock.commandCalls(PutCommand)[0].args[0].input).toEqual({
        TableName: 'test-claims-table',
        Item: claim.toJson(),
        ConditionExpression: 'attribute_not_exists(claimId)',
      });
    });

    it('should throw ValidationError when claim already exists', async () => {
      const claim = Claim.create({
        id: 'dup-1',
        memberId: 'mbr-1',
        provider: 'Provider',
        serviceDate: new Date(),
        totalAmount: 500,
      });

      ddbMock.on(PutCommand).rejects(new ConditionalCheckFailedException({ message: '', $metadata: {} }));

      await expect(repository.save(claim)).rejects.toThrow(ValidationError);
    });

    it('should throw InfraError when DynamoDB throttles', async () => {
      const claim = Claim.create({
        id: 'throttle-1',
        memberId: 'mbr-1',
        provider: 'Provider',
        serviceDate: new Date(),
        totalAmount: 200,
      });

      ddbMock.on(PutCommand).rejects(new ThrottlingException({ message: '', $metadata: {} }));

      await expect(repository.save(claim)).rejects.toThrow(InfraError);
    });

    it('should throw InfraError with "Access denied" when DynamoDB returns AccessDeniedException', async () => {
      const claim = Claim.create({
        id: 'clm-err',
        memberId: 'mbr-err',
        provider: 'Provider',
        serviceDate: new Date('2025-01-01'),
        totalAmount: 1000,
      });

      ddbMock.on(PutCommand).rejects(new AccessDeniedException({ Message: 'Access denied', message: 'Access denied', $metadata: {} }));

      await expect(repository.save(claim)).rejects.toThrow(InfraError);
      await expect(repository.save(claim)).rejects.toThrow(/Access denied/);
    });
  });

  describe('findById', () => {
    it('should return undefined if not found', async () => {
      ddbMock.on(GetCommand).resolves({ Item: undefined });

      const result = await repository.findById('not-exist');
      expect(result).toBeUndefined();
    });

    it('should return claim if found', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          claimId: 'clm-1',
          memberId: 'mbr-1',
          provider: 'ProviderX',
          serviceDate: '2025-01-01T00:00:00Z',
          totalAmount: 1200,
          diagnosisCodes: ['M54.5'],
        },
      });

      const result = await repository.findById('clm-1');
      expect(result?.id).toBe('clm-1');
      expect(result?.memberId).toBe('mbr-1');
      expect(result?.provider).toBe('ProviderX');
    });

    it('should throw InfraError if GetCommand fails', async () => {
      ddbMock.on(GetCommand).rejects(new ThrottlingException({ message: 'Throttled', $metadata: {} }));

      await expect(repository.findById('any-id')).rejects.toThrow(InfraError);
    });

    it('should throw InfraError with "Operation failure" when an unknown error occurs', async () => {
      ddbMock.on(GetCommand).rejects(new Error('Something weird'));

      await expect(repository.findById('clm-unknown')).rejects.toThrow(InfraError);
      await expect(repository.findById('clm-unknown')).rejects.toThrow(/Operation failure/);
    });
  });

  describe('findByMemberAndDateRange', () => {
    it('should return claims within range', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [
          {
            claimId: 'clm-1',
            memberId: 'mbr-1',
            provider: 'ProviderA',
            serviceDate: '2025-01-10T00:00:00Z',
            totalAmount: 5000,
          },
        ],
      });

      const result = await repository.findByMemberAndDateRange({
        memberId: 'mbr-1',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('clm-1');
    });

    it('should return empty array if no items found', async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [] });

      const result = await repository.findByMemberAndDateRange({
        memberId: 'mbr-1',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      });

      expect(result).toEqual([]);
    });

    it('should throw InfraError if DynamoDB fails', async () => {
      ddbMock.on(QueryCommand).rejects(new ResourceNotFoundException({ message: '', $metadata: {} }));

      await expect(
        repository.findByMemberAndDateRange({ memberId: 'mbr-1', startDate: new Date('2025-01-01'), endDate: new Date('2025-01-31') }),
      ).rejects.toThrow(InfraError);
    });

    it('should return empty array when Items is undefined', async () => {
      ddbMock.on(QueryCommand).resolves({} as any);

      const result = await repository.findByMemberAndDateRange({
        memberId: 'mbr-1',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      });

      expect(result).toEqual([]);
    });
  });
});
