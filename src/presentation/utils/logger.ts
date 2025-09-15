/* istanbul ignore file */
import { Logger } from '@aws-lambda-powertools/logger';
import { LogLevel } from '@aws-lambda-powertools/logger/lib/cjs/types/Logger';

const isValidLogLevel = (level: string): level is LogLevel => ['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(level);

const getLogLevel = (): LogLevel => {
  const level = process.env.LOG_LEVEL;
  return level && isValidLogLevel(level) ? level : 'INFO';
};

export const logger = new Logger({
  logLevel: getLogLevel(),
  serviceName: process.env.SERVICE_NAME || 'item-service',
  persistentLogAttributes: {
    environment: process.env.ENVIRONMENT || 'dev',
  },
});
