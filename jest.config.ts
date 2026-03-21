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
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: '<rootDir>/tsconfig.web.json'
        }]
      },
      testEnvironment: 'jsdom',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['@testing-library/jest-dom'],
      moduleNameMapper: {
        // react-virtuoso and ansi-to-html use ESM — stub them for jest
        'react-virtuoso': '<rootDir>/src/renderer/__tests__/__mocks__/react-virtuoso.tsx',
        'ansi-to-html': '<rootDir>/src/renderer/__tests__/__mocks__/ansi-to-html.ts'
      }
    }
  ]
};

export default config;
