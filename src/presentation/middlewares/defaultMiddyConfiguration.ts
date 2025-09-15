/* istanbul ignore file */
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import onErrorSerialiseToJson from './onErrorSerialiseToJson';
import exposeValidationErrors from './exposeValidationErrors';
import { Logger } from '@aws-lambda-powertools/logger';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpSecurityHeaders from '@middy/http-security-headers';

export const defaultMiddleware =
  <T>(logger: Logger) =>
  (validationSchema: z.AnyZodObject) => {
    return middy<T, APIGatewayProxyResult>()
      .use(httpEventNormalizer())
      .use(httpJsonBodyParser())
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
            const origins = ['http://localhost:3000', 'https://*.mydomain.com'];

            const match = origins.find((origin) => {
              const regexPattern = new RegExp(origin.replace(/\./g, '\\.').replace(/\*/g, '.*'));
              return regexPattern.test(incomingOrigin);
            });

            return match ? incomingOrigin : '';
          },
          disableBeforePreflightResponse: false,
          methods: 'GET, POST',
        }),
      )
      .use(
        validator({
          eventSchema: transpileSchema(zodToJsonSchema(validationSchema, { target: 'openApi3' })),
        }),
      )
      .use(onErrorSerialiseToJson())
      .use(exposeValidationErrors(logger))
      .use(
        httpErrorHandler({
          logger: (error) => logger.error('error encountered:', error),
          fallbackMessage: 'An unexpected error occurred',
        }),
      );
  };
