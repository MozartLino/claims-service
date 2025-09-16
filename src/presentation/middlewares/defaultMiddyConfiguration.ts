/* istanbul ignore file */
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import onErrorSerialiseToJson from './onErrorSerialiseToJson';
import exposeValidationErrors from './exposeValidationErrors';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpSecurityHeaders from '@middy/http-security-headers';
import httpMultipartBodyParser from '@middy/http-multipart-body-parser';
import { transpileSchema } from '@middy/validator/transpile';
import { APIGatewayProxyResult } from 'aws-lambda';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Logger } from '@aws-lambda-powertools/logger';
import { MiddlewareOptions } from './type';
import { logRequest } from '../utils/logRequest';

export const defaultMiddleware =
  <T>(logger: Logger) =>
  (options: MiddlewareOptions) => {
    const { enableJsonParser = true, enableMultipartParser = false, schema } = options;

    const chain = middy<T, APIGatewayProxyResult>()
      .use(logRequest(logger))
      .use(httpEventNormalizer())
      .use(httpSecurityHeaders({}))
      .use(
        httpHeaderNormalizer({
          canonical: false,
          defaultHeaders: {},
        }),
      )
      .use(
        cors({
          getOrigin(incomingOrigin) {
            const origins = [''];

            const match = origins.find((origin) => {
              const regexPattern = new RegExp(origin.replace(/\./g, '\\.').replace(/\*/g, '.*'));
              return regexPattern.test(incomingOrigin);
            });

            return match ? incomingOrigin : '';
          },
          disableBeforePreflightResponse: false,
          methods: 'GET, POST',
        }),
      );

    if (enableJsonParser) {
      chain.use(httpJsonBodyParser({ disableContentTypeError: true }));
    }

    if (enableMultipartParser) {
      chain.use(httpMultipartBodyParser({ disableContentTypeError: true }));
    }

    return chain
      .use(onErrorSerialiseToJson())
      .use(
        validator({
          eventSchema: transpileSchema(zodToJsonSchema(schema, { target: 'openApi3' })),
        }),
      )
      .use(exposeValidationErrors(logger))
      .use(
        httpErrorHandler({
          logger: (error) => logger.error('error encountered:', error),
          fallbackMessage: 'An unexpected error occurred',
        }),
      );
  };
