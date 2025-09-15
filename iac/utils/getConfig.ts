import { App } from 'aws-cdk-lib';
import { z } from 'zod';
import { ConfigStackProps } from '../types';

export const stageSchema = z.enum(['prod', 'dev', 'stg']);
export const logLevelSchema = z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']);
export const configSchema = z
  .object({
    REGION: z
      .string()
      .regex(/^[a-zA-Z]+-[a-zA-Z]+-\d$/, 'value for AWS Region does not match expected structure.')
      .default('us-east-1'),
    SERVICE_NAME: z.string().optional().default('items-service'),
    STAGE: stageSchema,
    LOG_LEVEL: logLevelSchema.optional().default('INFO'),
  })
  .strict();

export const getEnvVars = (app: App, environment: string) => {
  const envVars = app.node.tryGetContext(environment);

  if (envVars) {
    return envVars;
  }

  return app.node.tryGetContext('dev');
};

export const getConfig = (app: App): ConfigStackProps => {
  const environment = app.node.tryGetContext('environment');

  if (typeof environment !== 'string' || environment === '') {
    throw new RangeError('Invalid input. "environment" is required param for this CDK stack.');
  }

  const envVars = configSchema.parse(getEnvVars(app, environment));

  return {
    region: envVars.REGION,
    stage: envVars.STAGE,
    logLevel: envVars.LOG_LEVEL,
    serviceName: envVars.SERVICE_NAME,
  };
};
