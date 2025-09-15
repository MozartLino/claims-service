import { CreateFunctionsInput } from '../types';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export function createFunctions({ scope, resources, config }: CreateFunctionsInput) {
  const { itemsTable } = resources;
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
        ITEMS_TABLE_NAME: itemsTable.tableName,
      },
      ...overrides,
    });

  const deleteItemHandler = makeFn('deleteItemHandler');
  itemsTable.grantReadWriteData(deleteItemHandler);

  const createItemHandler = makeFn('createItemHandler');
  itemsTable.grantReadWriteData(createItemHandler);

  const updateItemHandler = makeFn('updateItemHandler');
  itemsTable.grantReadWriteData(updateItemHandler);

  const listItemHandler = makeFn('listItemHandler');
  itemsTable.grantReadData(listItemHandler);

  const getItemByIdHandler = makeFn('getItemByIdHandler');
  itemsTable.grantReadData(getItemByIdHandler);

  return { deleteItemHandler, createItemHandler, updateItemHandler, listItemHandler, getItemByIdHandler };
}
