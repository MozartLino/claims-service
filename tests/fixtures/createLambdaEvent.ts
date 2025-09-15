import { APIGatewayProxyEvent } from 'aws-lambda';

export default (context?: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent => {
  return {
    resource: '/my-resource',
    path: '/my-resource',
    httpMethod: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    multiValueHeaders: {
      Accept: ['application/json', 'text/plain'],
      'Custom-Header': ['value1', 'value2'],
    },
    queryStringParameters: {
      param1: 'value1',
      param2: 'value2',
    },
    multiValueQueryStringParameters: {
      param3: ['value3', 'value4'],
      param4: ['value5'],
    },
    pathParameters: {
      param5: 'value6',
      param6: 'value7',
    },
    stageVariables: {
      stageVar1: 'stageValue1',
      stageVar2: 'stageValue2',
    },
    requestContext: {
      accountId: '1234567890',
      resourceId: 'abc123',
      stage: 'prod',
      requestId: 'def456',
      requestTime: '2025-09-14T15:32:44Z',
      requestTimeEpoch: 1666763564000,
      authorizer: null,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'Custom User Agent String',
        userArn: null,
      },
      resourcePath: '/my-resource',
      httpMethod: 'GET',
      apiId: 'my-api-id',
      protocol: 'HTTP/1.1',
      path: '/my-resource',
    },
    body: '{}',
    isBase64Encoded: false,
    ...context,
  };
};
