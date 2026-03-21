import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'main',
      testMatch: ['<rootDir>/src/main/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest'
      },
      testEnvironment: 'node',
      moduleFileExtensions: ['ts', 'js', 'json']
    },
    {
      displayName: 'renderer',
      testMatch: ['<rootDir>/src/renderer/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      testEnvironment: 'jsdom',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['@testing-library/jest-dom']
    }
  ]
};

export default config;
