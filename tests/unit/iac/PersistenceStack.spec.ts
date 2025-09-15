import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { PersistenceStack } from '../../../iac/stacks/PersistenceStack';

describe('PersistenceStack', () => {
  it('should create a DynamoDB table with correct schema', () => {
    const app = new App();
    const stack = new PersistenceStack(app, 'TestPersistenceStack', { stage: 'dev' });
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'items',
      KeySchema: [{ AttributeName: 'itemId', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'itemId', AttributeType: 'S' }],
    });
  });

  it('should set DeletionPolicy to Retain when stage is prod', () => {
    const app = new App();
    const stack = new PersistenceStack(app, 'ProdPersistenceStack', { stage: 'prod' });
    const template = Template.fromStack(stack);

    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Retain',
    });
  });
});
