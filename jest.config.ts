import {JestConfigWithTsJest} from 'ts-jest/dist/types';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/jest/', '/build/', '/testUtils.ts'],
  testTimeout: 300000, // 300 seconds
  transformIgnorePatterns: ['/node_modules/(?!(nanoid)/)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
};

module.exports = config;
