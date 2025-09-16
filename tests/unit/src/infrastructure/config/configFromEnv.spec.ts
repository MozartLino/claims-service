import configFromEnv from '../../../../../src/infrastructure/config/configFromEnv';
import * as envVars from '../../../../../src/infrastructure/config/envVars';

describe('configFromEnv', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return config with default values if environment variables are not set', () => {
    process.env = {};
    const config = configFromEnv();

    expect(config.region).toBe('us-east-1');
    expect(config.logLevel).toBe('info');
    expect(config.stage).toBe('dev');
    expect(config.serviceName).toBe('claims-service');
    expect(config.claimsTableName).toBe('claimsTable');
    expect(config.claimsByMemberAndDateIndex).toBe('claimsByMemberAndDate');
  });

  it('should return config with values from environment variables', () => {
    process.env[envVars.region] = 'CUSTOM_REGION';
    process.env[envVars.logLevel] = 'DEBUG';
    process.env[envVars.stage] = 'prod';
    process.env[envVars.serviceName] = 'claims-service';
    process.env[envVars.claimsTableName] = 'ClaimsTable';
    process.env[envVars.claimsByMemberAndDateIndex] = 'ClaimsByMemberAndDateIndex';

    const config = configFromEnv();

    expect(config).toEqual({
      region: 'CUSTOM_REGION',
      stage: 'prod',
      logLevel: 'DEBUG',
      serviceName: 'claims-service',
      claimsTableName: 'ClaimsTable',
      claimsByMemberAndDateIndex: 'ClaimsByMemberAndDateIndex',
    });
  });
});
