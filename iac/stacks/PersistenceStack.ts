import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Table, BillingMode, TableEncryption, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { PersistenceStackProps } from '../types';

export class PersistenceStack extends Stack {
  public readonly claimsTable: Table;
  public static readonly CLAIMS_TABLE_NAME = 'claims';
  public static readonly CLAIMS_BY_MEMBER_AND_DATE_INDEX = 'claimsByMemberAndDate';

  constructor(scope: Construct, id: string, props: PersistenceStackProps) {
    super(scope, id, props);

    this.claimsTable = new Table(this, 'claimsTable', {
      tableName: PersistenceStack.CLAIMS_TABLE_NAME,
      partitionKey: {
        name: 'claimId',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      encryption: TableEncryption.AWS_MANAGED,
      removalPolicy: props.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    this.claimsTable.addGlobalSecondaryIndex({
      indexName: PersistenceStack.CLAIMS_BY_MEMBER_AND_DATE_INDEX,
      partitionKey: { name: 'memberId', type: AttributeType.STRING },
      sortKey: { name: 'serviceDate', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
  }
}
