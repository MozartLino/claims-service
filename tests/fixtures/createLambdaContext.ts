import { Context } from 'aws-lambda';

export default (context?: Partial<Context>): Context => {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'example-function-name',
    functionVersion: 'v1',
    invokedFunctionArn: 'arn::example:',
    memoryLimitInMB: '128MB',
    awsRequestId: '',
    logGroupName: 'example-log-group',
    logStreamName: 'log-stream-123',
    getRemainingTimeInMillis: () => 1256,
    done: () => 'done',
    fail: () => 'fail',
    succeed: () => 'succeed',
    ...context,
  };
};
