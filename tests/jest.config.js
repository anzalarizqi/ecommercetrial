/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/**/*.test.js'],
      setupFiles: ['<rootDir>/setup.js'],
      testTimeout: 10000,
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: ['<rootDir>/frontend/**/*.test.{js,jsx}'],
      testTimeout: 10000,
      setupFiles: ['<rootDir>/setupFrontend.js'],
      resolver: '<rootDir>/resolver.js',
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
      },
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
      },
    },
  ],
};
