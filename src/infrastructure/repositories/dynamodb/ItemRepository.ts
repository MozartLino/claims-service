import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { ItemDBDTO } from '../../model/itemDBModel';
import { Item } from '../../../domain/models/Item';
import { IItemRepository } from '../../../domain/repository/IItemRepository';
import { Config } from '../../config/types';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  ConditionalCheckFailedException,
  ProvisionedThroughputExceededException,
  ResourceNotFoundException,
  ThrottlingException,
} from '@aws-sdk/client-dynamodb';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { IPaginatedItemRepository, PaginatedListParams, PaginatedListResult } from '../../../domain/repository/IPaginatedItemRepository';
import { InfraError } from '../../../domain/errors/InfraError';
import { AccessDeniedException } from '@aws-sdk/client-ssm';

export class ItemRepository implements IItemRepository, IPaginatedItemRepository {
  constructor(
    private readonly db: DynamoDBDocumentClient,
    private readonly config: Config,
    private readonly logger: Logger,
  ) {}

  async save(item: Item): Promise<void> {
    try {
      const dto: ItemDBDTO = {
        itemId: item.id,
        name: item.name,
        createdAt: item.createdAt.toISOString(),
        version: item.version,
      };

      this.logger.info('Saving item to DynamoDB', { dto });

      await this.db.send(
        new PutCommand({
          TableName: this.config.itemsTableName,
          Item: dto,
        }),
      );
    } catch (e) {
      this.handleDynamoError(e);
    }
  }

  async findById(itemId: string): Promise<Item | undefined> {
    try {
      const result = await this.db.send(
        new GetCommand({
          TableName: this.config.itemsTableName,
          Key: { itemId },
        }),
      );

      this.logger.info('Retrieved item from DynamoDB', { result });

      if (!result.Item) return undefined;

      return Item.restore({
        id: result.Item.itemId,
        name: result.Item.name,
        createdAt: result.Item.createdAt,
        version: result.Item.version,
      });
    } catch (e) {
      this.handleDynamoError(e);
    }
  }

  async update(item: Item): Promise<Item> {
    this.logger.info('Updating item in DynamoDB', { item });

    try {
      const res = await this.db.send(
        new UpdateCommand({
          TableName: this.config.itemsTableName,
          Key: { itemId: item.id },
          UpdateExpression: 'SET #name = :name ADD #version :one',
          ConditionExpression: 'attribute_exists(itemId) AND #version = :expected',
          ExpressionAttributeNames: {
            '#name': 'name',
            '#version': 'version',
          },
          ExpressionAttributeValues: {
            ':name': item.name,
            ':expected': item.version,
            ':one': 1,
          },
          ReturnValues: 'ALL_NEW',
        }),
      );

      return Item.restore({
        id: res.Attributes?.itemId,
        name: res.Attributes?.name,
        createdAt: res.Attributes?.createdAt,
        version: res.Attributes?.version,
      });
    } catch (error) {
      this.handleDynamoError(error);
    }
  }

  async delete(itemId: string): Promise<void> {
    try {
      this.logger.info('Deleting item from DynamoDB', { itemId });

      await this.db.send(
        new DeleteCommand({
          TableName: this.config.itemsTableName,
          Key: { itemId },
        }),
      );
    } catch (error) {
      this.handleDynamoError(error);
    }
  }

  async list(params: PaginatedListParams): Promise<PaginatedListResult> {
    try {
      const { limit = 10, cursor } = params;

      const input: ScanCommandInput = {
        TableName: this.config.itemsTableName,
        Limit: Number(limit),
        ExclusiveStartKey: cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8')) : undefined,
      };

      const result = await this.db.send(new ScanCommand(input));

      const items =
        result.Items?.map((raw) =>
          Item.restore({
            id: raw.itemId,
            name: raw.name,
            createdAt: raw.createdAt,
            version: raw.version,
          }),
        ) ?? [];

      const nextCursor = result.LastEvaluatedKey ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : undefined;

      return { items, cursor: nextCursor };
    } catch (error) {
      this.handleDynamoError(error);
    }
  }

  private handleDynamoError(e: unknown): never {
    this.logger.error('DynamoDB operation failed', { error: e });
    const table = this.config.itemsTableName;

    if (e instanceof ConditionalCheckFailedException) {
      throw ConflictError.versionMismatch();
    }
    if (e instanceof ProvisionedThroughputExceededException || e instanceof ThrottlingException) {
      throw new InfraError('Throttled', { table, cause: e });
    }
    if (e instanceof ResourceNotFoundException) {
      throw new InfraError('Resource not found', { table, cause: e });
    }
    if (e instanceof AccessDeniedException) {
      throw new InfraError('Access denied', { table, cause: e });
    }

    throw new InfraError('Operation failure', { table, cause: e });
  }
}
