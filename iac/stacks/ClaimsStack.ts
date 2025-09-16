import { CfnOutput, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createFunctions } from '../resources/functions';
import { ClaimsStackProps } from '../types';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class ClaimsStack extends Stack {
  constructor(scope: Construct, id: string, props: ClaimsStackProps) {
    super(scope, id, props);

    const { resources, serviceName, stage } = props;

    const { ingestionClaimsHandler, getClaimByIdHandler, listClaimsHandler } = createFunctions({
      scope: this,
      resources,
      config: props,
    });

    const api = new apigw.RestApi(this, 'ClaimsServiceApi', {
      restApiName: `${serviceName}-${stage}`,
      deployOptions: { stageName: stage },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    const claims = api.root.addResource('claims');
    claims.addMethod('POST', new apigw.LambdaIntegration(ingestionClaimsHandler));
    claims.addMethod('GET', new apigw.LambdaIntegration(listClaimsHandler));

    const singleClaim = claims.addResource('{id}');
    singleClaim.addMethod('GET', new apigw.LambdaIntegration(getClaimByIdHandler));

    new CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
