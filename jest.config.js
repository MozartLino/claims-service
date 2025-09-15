/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/iac', '<rootDir>/tests'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    'iac/**/*.ts',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/types.ts'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '.*\\.spec\\.ts$'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.[tj]s$': 'babel-jest',
  }
};
