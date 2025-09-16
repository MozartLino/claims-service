/* istanbul ignore file */
import { MiddlewareObj } from '@middy/core';
import { Logger } from '@aws-lambda-powertools/logger';

export const logRequest = (logger: Logger): MiddlewareObj => ({
  before: async (request) => {
    logger.debug('Incoming event', { event: request.event });
  },
});
