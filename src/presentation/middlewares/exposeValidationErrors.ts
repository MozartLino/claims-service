import { Logger } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { isHttpError } from 'http-errors';

const middleware = (logger: Logger): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const onError: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (request) => {
    const { response, error } = request;

    logger.info('Exposing validation errors in middleware', { response, error });

    if (!response || !error || !isHttpError(error)) {
      return;
    }

    if (!error.cause || error.statusCode !== 400) {
      return;
    }

    if (response.headers) {
      response.headers['Content-Type'] = 'application/json';
    } else {
      logger.info('creating content-type onError middleware');
      response.headers = { 'Content-Type': 'application/json' };
    }

    response.body = JSON.stringify({ message: response.body, validationErrors: error.cause });
  };

  return {
    onError,
  };
};

export default middleware;
