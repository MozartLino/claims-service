import { CfnOutput, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ItemsStackProps } from '../types';
import { createFunctions } from '../resources/functions';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class ItemsStack extends Stack {
  constructor(scope: Construct, id: string, props: ItemsStackProps) {
    super(scope, id, props);

    const { resources, serviceName, stage } = props;

    const { deleteItemHandler, createItemHandler, updateItemHandler, listItemHandler, getItemByIdHandler } = createFunctions({
      scope: this,
      resources,
      config: props,
    });

    const api = new apigw.RestApi(this, 'ItemsServiceApi', {
      restApiName: `${serviceName}-${stage}`,
      deployOptions: { stageName: stage },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    const items = api.root.addResource('items');
    items.addMethod('POST', new apigw.LambdaIntegration(createItemHandler));
    items.addMethod('GET', new apigw.LambdaIntegration(listItemHandler));

    const singleItem = items.addResource('{id}');
    singleItem.addMethod('PUT', new apigw.LambdaIntegration(updateItemHandler));
    singleItem.addMethod('GET', new apigw.LambdaIntegration(getItemByIdHandler));
    singleItem.addMethod('DELETE', new apigw.LambdaIntegration(deleteItemHandler));

    new CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
