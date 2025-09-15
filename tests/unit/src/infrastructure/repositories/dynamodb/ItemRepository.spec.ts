import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Config } from '../../../../../../src/infrastructure/config/types';
import { mockLogger } from '../../../../../fixtures/mocks';
import { ItemRepository } from '../../../../../../src/infrastructure/repositories/dynamodb/ItemRepository';
import { mockClient } from 'aws-sdk-client-mock';
import { Item } from '../../../../../../src/domain';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  ProvisionedThroughputExceededException,
  ResourceNotFoundException,
  ThrottlingException,
} from '@aws-sdk/client-dynamodb';
import { ConflictError, InfraError } from '../../../../../../src/domain/errors';
import { AccessDeniedException } from '@aws-sdk/client-ssm';

const ddbMock = mockClient(DynamoDBDocumentClient);
const dynamodb = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamodb);

describe('ItemRepository', () => {
  const config: Config = { itemsTableName: 'test-table' } as Config;
  const repository = new ItemRepository(ddb, config, mockLogger);

  beforeEach(() => {
    jest.clearAllMocks();
    ddbMock.reset();
  });

  describe('save', () => {
    it('should send PutCommand to DynamoDB with correct item', async () => {
      const item = Item.create({ id: 'item-1', name: 'Test Item', createdAt: new Date('2023-01-01'), version: 0 });
      await repository.save(item);
      expect(ddbMock.commandCalls(PutCommand)[0].args[0].input).toEqual({
        TableName: 'test-table',
        Item: { itemId: 'item-1', name: 'Test Item', createdAt: '2023-01-01T00:00:00.000Z', version: 0 },
      });
    });

    it('should throw InfraError when DynamoDB throttles during save', async () => {
      const item = Item.create({
        id: 'item-2',
        name: 'Throttled Item',
        createdAt: new Date(),
        version: 0,
      });

      ddbMock.on(PutCommand).rejects(new ThrottlingException({ message: '', $metadata: {} }));
      await expect(repository.save(item)).rejects.toThrow(InfraError);
    });

    it('should throw InfraError(Operation failure) on unknown DynamoDB error', async () => {
      const item = Item.create({
        id: 'item-x',
        name: 'Unknown',
        createdAt: new Date(),
        version: 0,
      });

      ddbMock.on(PutCommand).rejects(new Error('Some unknown error'));

      await expect(repository.save(item)).rejects.toThrow(InfraError);
    });
  });

  describe('findById', () => {
    it('should return undefined if item not found', async () => {
      ddbMock.on(GetCommand).resolves({ Item: undefined });
      const item = await repository.findById('not-exist');
      expect(item).toBeUndefined();
    });

    it('should return item if found', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          itemId: 'item-1',
          name: 'Test',
          createdAt: '2024-01-01T00:00:00Z',
          version: 0,
        },
      });

      const item = await repository.findById('item-1');
      expect(item?.id).toBe('item-1');
      expect(item?.name).toBe('Test');
    });

    it('should throw InfraError if DynamoDB GetCommand fails', async () => {
      ddbMock.on(GetCommand).rejects(new ThrottlingException({ message: '', $metadata: {} }));

      await expect(repository.findById('item-error')).rejects.toThrow(InfraError);
    });
  });

  describe('update', () => {
    it('should send UpdateCommand and return updated item', async () => {
      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          itemId: 'item-1',
          name: 'Updated Name',
          createdAt: '2023-01-01T00:00:00.000Z',
          version: 1,
        },
      });

      const updated = await repository.update(
        Item.create({
          id: 'item-1',
          name: 'Updated Name',
          createdAt: new Date('2023-01-01'),
          version: 0,
        }),
      );

      expect(updated.name).toBe('Updated Name');
      expect(updated.version).toBe(1);
    });

    it('should throw ConflictError on ConditionalCheckFailedException', async () => {
      ddbMock.on(UpdateCommand).rejects(new ConditionalCheckFailedException({ message: '', $metadata: {} }));

      await expect(
        repository.update(
          Item.create({
            id: 'item-1',
            name: 'Updated Name',
            createdAt: new Date('2023-01-01'),
            version: 0,
          }),
        ),
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError on ProvisionedThroughputExceededException', async () => {
      ddbMock.on(UpdateCommand).rejects(new ProvisionedThroughputExceededException({ message: '', $metadata: {} }));

      await expect(
        repository.update(
          Item.create({
            id: 'item-1',
            name: 'Updated Name',
            createdAt: new Date('2023-01-01'),
            version: 0,
          }),
        ),
      ).rejects.toThrow(InfraError);
    });

    it('should throw ConflictError on ResourceNotFoundException', async () => {
      ddbMock.on(UpdateCommand).rejects(new ResourceNotFoundException({ message: '', $metadata: {} }));

      await expect(
        repository.update(
          Item.create({
            id: 'item-1',
            name: 'Updated Name',
            createdAt: new Date('2023-01-01'),
            version: 0,
          }),
        ),
      ).rejects.toThrow(InfraError);
    });

    it('should throw ConflictError on AccessDeniedException', async () => {
      ddbMock.on(UpdateCommand).rejects(new AccessDeniedException({ Message: '', message: '', $metadata: {} }));

      await expect(
        repository.update(
          Item.create({
            id: 'item-1',
            name: 'Updated Name',
            createdAt: new Date('2023-01-01'),
            version: 0,
          }),
        ),
      ).rejects.toThrow(InfraError);
    });

    it('should throw InfraError when UpdateCommand returns empty Attributes', async () => {
      ddbMock.on(UpdateCommand).resolves({ Attributes: undefined } as any);

      await expect(
        repository.update(
          Item.create({
            id: 'item-1',
            name: 'Any',
            createdAt: new Date('2023-01-01'),
            version: 0,
          }),
        ),
      ).rejects.toThrow(InfraError);
    });
  });

  describe('delete', () => {
    it('should call DeleteCommand', async () => {
      ddbMock.on(DeleteCommand).resolves({});
      await repository.delete('item-1');
      expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(1);
    });

    it('should throw InfraError if DynamoDB DeleteCommand fails', async () => {
      ddbMock.on(DeleteCommand).rejects(new ThrottlingException({ message: '', $metadata: {} }));

      await expect(repository.delete('item-error')).rejects.toThrow(InfraError);
    });
  });

  describe('list', () => {
    it('should return items and undefined cursor when LastEvaluatedKey is not present', async () => {
      ddbMock.on(ScanCommand).resolves({
        Items: [
          {
            itemId: 'item-1',
            name: 'Item One',
            createdAt: '2023-01-01T00:00:00.000Z',
            version: 0,
          },
        ],
      } as any);

      const result = await repository.list({ limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('item-1');
      expect(result.cursor).toBeUndefined();
    });

    it('should return items and a next cursor when LastEvaluatedKey is present', async () => {
      const lastEvaluatedKey = { itemId: 'item-2' };

      ddbMock.on(ScanCommand).resolves({
        Items: [
          {
            itemId: 'item-1',
            name: 'Item One',
            createdAt: '2023-01-01T00:00:00.000Z',
            version: 0,
          },
        ],
        LastEvaluatedKey: lastEvaluatedKey,
      } as any);

      const result = await repository.list({ limit: 10, cursor: 'eyJpdGVtSWQiOiJlYjkyZDMyYi0wM2Q0LTQ2NDYtYTg4NS0yNTk1MzEzZjFiOGIifQ==' });

      expect(result.items[0].id).toBe('item-1');
      expect(result.cursor).toBe(Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64'));
    });

    it('should return empty items array when no Items are found', async () => {
      ddbMock.on(ScanCommand).resolves({} as any);

      const result = await repository.list({ limit: 10 });

      expect(result.items).toEqual([]);
      expect(result.cursor).toBeUndefined();
    });

    it('should call handleDynamoError if ScanCommand fails', async () => {
      ddbMock.on(ScanCommand).rejects(new ThrottlingException({ message: '', $metadata: {} }));

      await expect(repository.list({})).rejects.toThrow(InfraError);
    });
  });
});
