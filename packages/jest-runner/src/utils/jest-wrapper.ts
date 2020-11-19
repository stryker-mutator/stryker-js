import { requireResolve } from '@stryker-mutator/util';
import type * as jestModule from 'jest';

// Use requireResolve, that way you can use this plugin from a different directory
const jest = requireResolve('jest') as typeof jestModule;

/**
 * Direct stubbing on jest is no longer possible since jest > 25
 */
class JestWrapper {
  public runCLI: typeof jestModule.runCLI = (...args) => {
    return jest.runCLI(...args);
  };
}

export const jestWrapper = new JestWrapper();
