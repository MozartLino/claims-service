import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Table, BillingMode, ITable, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { PersistenceStackProps } from '../types';

export class PersistenceStack extends Stack {
  public readonly itemsTable: ITable;

  constructor(scope: Construct, id: string, props: PersistenceStackProps) {
    super(scope, id, props);

    this.itemsTable = new Table(this, 'itemsTable', {
      tableName: 'items',
      partitionKey: {
        name: 'itemId',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      encryption: TableEncryption.AWS_MANAGED,
      removalPolicy: props.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
  }
}
