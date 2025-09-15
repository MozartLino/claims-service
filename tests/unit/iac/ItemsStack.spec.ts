import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { PersistenceStack } from '../../../iac/stacks/PersistenceStack';
import { ItemsStack } from '../../../iac/stacks/ItemsStack';
import { mockConfig } from '../../fixtures/mocks';

const createStacks = () => {
  const app = new App();
  const persistence = new PersistenceStack(app, 'TestPersistenceStack', { stage: mockConfig.stage });

  const itemsStack = new ItemsStack(app, 'TestItemsStack', {
    resources: { itemsTable: persistence.itemsTable },
    ...mockConfig,
    env: { region: 'us-east-1' },
    stackName: 'TestItemsStack',
  });

  return { template: Template.fromStack(itemsStack), itemsStack };
};

describe('ItemsStack', () => {
  it('should create an API Gateway with the correct resources and methods', () => {
    const { template } = createStacks();

    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: `${mockConfig.serviceName}-${mockConfig.stage}`,
    });

    template.resourceCountIs('AWS::ApiGateway::Method', 8);

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'POST',
    });

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
    });

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'PUT',
    });

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'DELETE',
    });
  });

  it('should output the API URL', () => {
    const { template } = createStacks();
    template.hasOutput('ApiUrl', Match.anyValue());
  });
});
