import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { isHttpError } from 'http-errors';

const middleware = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const onError: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = (request) => {
    const { response, error } = request;

    if (!response || response.headers?.['Content-Type'] !== 'text/plain') {
      return;
    }

    response.headers['Content-Type'] = 'application/json';
    response.body =
      error && isHttpError(error) ? JSON.stringify({ message: response.body, ...error.cause }) : JSON.stringify({ message: response.body });
  };

  return {
    onError,
  };
};

export default middleware;
