import { CreateFunctionsInput } from '../types';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { PersistenceStack } from '../stacks/PersistenceStack';

export function createFunctions({ scope, resources, config }: CreateFunctionsInput) {
  const { claimsTable } = resources;
  const makeFn = (handler: string, overrides?: Partial<lambdaNode.NodejsFunctionProps>) =>
    new lambdaNode.NodejsFunction(scope, handler, {
      handler,
      entry: path.join(__dirname, '../../src/index.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      functionName: `${config.serviceName}-${config.stage}-${handler}`,
      bundling: {
        minify: config.stage === 'prod',
        sourceMap: true,
        target: 'node22',
      },
      environment: {
        SERVICE_NAME: config.serviceName,
        STAGE: config.stage,
        CLAIMS_TABLE_NAME: PersistenceStack.CLAIMS_TABLE_NAME,
        GSI_INDEX_NAME: PersistenceStack.CLAIMS_BY_MEMBER_AND_DATE_INDEX,
      },
      ...overrides,
    });

  const ingestionClaimsHandler = makeFn('ingestionClaimsHandler');
  claimsTable.grantReadWriteData(ingestionClaimsHandler);

  const getClaimByIdHandler = makeFn('getClaimByIdHandler');
  claimsTable.grantReadData(getClaimByIdHandler);

  const listClaimsHandler = makeFn('listClaimsHandler');
  claimsTable.grantReadData(listClaimsHandler);

  return { ingestionClaimsHandler, getClaimByIdHandler, listClaimsHandler };
}
