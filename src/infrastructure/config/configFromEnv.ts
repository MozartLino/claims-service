import * as envVars from './envVars';
import { Config, Stage } from './types';

/**
 * Get config from environment variables.
 *
 */
const configFromEnv = (): Config => ({
  region: process.env[envVars.region] ?? 'us-east-1',
  logLevel: process.env[envVars.logLevel] ?? 'info',
  stage: (process.env[envVars.stage] as Stage) ?? 'dev',
  serviceName: process.env[envVars.serviceName] ?? 'items-service',
  itemsTableName: process.env[envVars.itemsTableName] ?? 'ItemsTable',
});

export default configFromEnv;
