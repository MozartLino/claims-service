import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ClaimQueryFilters, IClaimsRepository } from '../../../domain/repository/IClaimsRepository';
import { Config } from '../../config/types';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  ConditionalCheckFailedException,
  ProvisionedThroughputExceededException,
  ResourceNotFoundException,
  ThrottlingException,
} from '@aws-sdk/client-dynamodb';
import { InfraError } from '../../../domain/errors/InfraError';
import { AccessDeniedException } from '@aws-sdk/client-ssm';
import { Claim, ValidationError } from '../../../domain';
import { ClaimDBModel } from '../../model/itemDBModel';
import { ClaimProps } from '../../../domain/models/types';

export class ClaimsRepository implements IClaimsRepository {
  constructor(
    private readonly db: DynamoDBDocumentClient,
    private readonly config: Config,
    private readonly logger: Logger,
  ) {}

  async save(claim: Claim): Promise<void> {
    try {
      const dto: ClaimDBModel = claim.toJson();

      this.logger.info('Saving claim to DynamoDB', { dto });

      await this.db.send(
        new PutCommand({
          TableName: this.config.claimsTableName,
          Item: dto,
          ConditionExpression: 'attribute_not_exists(claimId)',
        }),
      );
    } catch (e) {
      this.handleDynamoError(e);
    }
  }

  async findById(claimId: string): Promise<Claim | undefined> {
    try {
      const result = await this.db.send(
        new GetCommand({
          TableName: this.config.claimsTableName,
          Key: { claimId },
        }),
      );

      this.logger.info('Retrieved claim from DynamoDB', { result });

      if (!result.Item) return undefined;

      const claimProps: ClaimProps = {
        id: result.Item.claimId,
        memberId: result.Item.memberId,
        provider: result.Item.provider,
        serviceDate: new Date(result.Item.serviceDate),
        totalAmount: result.Item.totalAmount,
        diagnosisCodes: result.Item.diagnosisCodes,
      };

      return Claim.create(claimProps);
    } catch (e) {
      this.handleDynamoError(e);
    }
  }

  async findByMemberAndDateRange(filters: ClaimQueryFilters): Promise<Claim[]> {
    try {
      const { memberId, startDate, endDate } = filters;

      const result = await this.db.send(
        new QueryCommand({
          TableName: this.config.claimsTableName,
          IndexName: this.config.claimsByMemberAndDateIndex,
          KeyConditionExpression: 'memberId = :memberId AND serviceDate BETWEEN :start AND :end',
          ExpressionAttributeValues: {
            ':memberId': memberId,
            ':start': startDate.toISOString(),
            ':end': endDate.toISOString(),
          },
          ScanIndexForward: false,
        }),
      );

      if (!result.Items) return [];

      return result.Items.map((item) =>
        Claim.create({
          id: item.claimId,
          memberId: item.memberId,
          provider: item.provider,
          serviceDate: new Date(item.serviceDate),
          totalAmount: item.totalAmount,
          diagnosisCodes: item.diagnosisCodes,
        }),
      );
    } catch (e) {
      this.handleDynamoError(e);
    }
  }

  private handleDynamoError(e: unknown): never {
    this.logger.error('DynamoDB operation failed', { error: e });
    const table = this.config.claimsTableName;

    if (e instanceof ConditionalCheckFailedException) {
      throw ValidationError.forField('id', 'A claim with the given ID already exists.');
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
