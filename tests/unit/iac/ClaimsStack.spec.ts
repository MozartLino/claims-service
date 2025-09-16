import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { PersistenceStack } from '../../../iac/stacks/PersistenceStack';
import { ClaimsStack } from '../../../iac/stacks/ClaimsStack';
import { mockConfig } from '../../fixtures/mocks';

const createStacks = () => {
  const app = new App();
  const persistence = new PersistenceStack(app, 'TestPersistenceStack', { stage: mockConfig.stage });

  const claimsStack = new ClaimsStack(app, 'TestClaimsStack', {
    resources: { claimsTable: persistence.claimsTable },
    ...mockConfig,
    env: { region: 'us-east-1' },
    stackName: 'TestClaimsStack',
  });

  return { template: Template.fromStack(claimsStack), claimsStack };
};

describe('ClaimsStack', () => {
  it('should create an API Gateway with the correct resources and methods', () => {
    const { template } = createStacks();

    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: `${mockConfig.serviceName}-${mockConfig.stage}`,
    });

    template.resourceCountIs('AWS::ApiGateway::Method', 6);

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'POST',
    });

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
    });
  });

  it('should output the API URL', () => {
    const { template } = createStacks();
    template.hasOutput('ApiUrl', Match.anyValue());
  });

  it('should create the Lambda functions', () => {
    const { template } = createStacks();

    template.resourceCountIs('AWS::Lambda::Function', 3);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.ingestionClaimsHandler',
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.getClaimByIdHandler',
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.listClaimsHandler',
    });
  });
});
