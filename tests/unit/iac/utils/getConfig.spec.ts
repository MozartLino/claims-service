import { App } from 'aws-cdk-lib';
import { configSchema, getConfig, getEnvVars } from '../../../../iac/utils/getConfig';
import { ConfigStackProps } from '../../../../iac/types';

describe('getConfig', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe('getEnvVars', () => {
    it('should return context for given environment', () => {
      app.node.setContext('prod', {
        REGION: 'us-west-2',
        STAGE: 'prod',
        LOG_LEVEL: 'ERROR',
      });

      const result = getEnvVars(app, 'prod');
      expect(result).toEqual({
        REGION: 'us-west-2',
        STAGE: 'prod',
        LOG_LEVEL: 'ERROR',
      });
    });

    it('should fallback to "dev" context if environment is not found', () => {
      app.node.setContext('dev', {
        REGION: 'us-east-1',
        STAGE: 'dev',
        LOG_LEVEL: 'INFO',
      });

      const result = getEnvVars(app, 'non-existent-env');
      expect(result).toEqual({
        REGION: 'us-east-1',
        STAGE: 'dev',
        LOG_LEVEL: 'INFO',
      });
    });
  });

  describe('getConfig', () => {
    it('should return full config if context is valid', () => {
      app.node.setContext('environment', 'stg');
      app.node.setContext('stg', {
        REGION: 'us-east-1',
        STAGE: 'stg',
        LOG_LEVEL: 'DEBUG',
        SERVICE_NAME: 'custom-service',
      });

      const result = getConfig(app);

      const expected: ConfigStackProps = {
        region: 'us-east-1',
        stage: 'stg',
        logLevel: 'DEBUG',
        serviceName: 'custom-service',
      };

      expect(result).toEqual(expected);
    });

    it('should apply default values for optional fields', () => {
      app.node.setContext('environment', 'dev');
      app.node.setContext('dev', {
        REGION: 'us-east-1',
        STAGE: 'dev',
      });

      const result = getConfig(app);

      expect(result).toEqual({
        region: 'us-east-1',
        stage: 'dev',
        logLevel: 'INFO',
        serviceName: 'claims-service',
      });
    });

    it('should throw if environment context is missing or invalid', () => {
      expect(() => getConfig(app)).toThrow(RangeError);
    });

    it('should throw if REGION has invalid format', () => {
      app.node.setContext('environment', 'invalid');
      app.node.setContext('invalid', {
        REGION: 'invalid-region',
        STAGE: 'dev',
      });

      expect(() => getConfig(app)).toThrow('value for AWS Region does not match expected structure');
    });

    it('should throw if STAGE is not one of allowed values', () => {
      app.node.setContext('environment', 'invalid');
      app.node.setContext('invalid', {
        REGION: 'us-east-1',
        STAGE: 'qa',
      });

      expect(() => getConfig(app)).toThrow();
    });
  });

  describe('configSchema', () => {
    it('should use default values when optional fields are missing', () => {
      const parsed = configSchema.parse({
        REGION: 'us-east-1',
        STAGE: 'prod',
      });

      expect(parsed.LOG_LEVEL).toBe('INFO');
      expect(parsed.SERVICE_NAME).toBe('claims-service');
    });
  });
});
