import * as jest from 'jest';

/**
 * Direct stubbing on jest is no longer possible since jest > 25
 */
class JestWrapper {
  public runCLI: typeof jest.runCLI = (...args) => {
    return jest.runCLI(...args);
  };
}

export const jestWrapper = new JestWrapper();
