export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Example pulled from: https://kulshekhar.github.io/ts-jest/user/config/#example
  moduleNameMapper: {
    '^@App/(.*)$': '<rootDir>/src/$1',
    '^lib/(.*)$': '<rootDir>/common/$1'
  }
};
