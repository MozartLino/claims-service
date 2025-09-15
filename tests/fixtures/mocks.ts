import { Logger } from '@aws-lambda-powertools/logger';

export const mockRepo = {
  save: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockPaginationRepo = {
  list: jest.fn(),
};

export const mockIdGenerator = {
  generate: jest.fn().mockReturnValue('uuid-123'),
};

export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

export const baseHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' }),
  };
};

export const mockConfig = {
  logLevel: 'DEBUG',
  region: 'us-east-1',
  stage: 'dev',
  serviceName: 'ItemService',
  itemsTableName: 'ItemsTable-dev',
} as const;
