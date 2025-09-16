import { Logger } from '@aws-lambda-powertools/logger';

export const mockRepo = {
  save: jest.fn(),
  findById: jest.fn(),
  findByMemberAndDateRange: jest.fn(),
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
  serviceName: 'ClaimsService',
  claimsTableName: 'test-claims-table',
  claimsByMemberAndDateIndex: 'test-claims-by-member-and-date-index',
} as const;

export const mockClaim = {
  id: 'clm-1',
  memberId: 'mbr-1',
  amount: 12500,
  serviceDate: new Date('2025-01-15'),
  description: 'Test claim',
};

export const mockClaims = [
  mockClaim,
  {
    id: 'clm-2',
    memberId: 'mbr-1',
    amount: 2500,
    serviceDate: new Date('2025-01-20'),
    description: 'Test claim 2',
  },
];
