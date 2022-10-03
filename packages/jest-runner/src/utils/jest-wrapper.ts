import { requireResolve } from '@stryker-mutator/util';
import type * as jestModule from 'jest';
import type * as jestConfigModule from 'jest-config';

// Use requireResolve, that way you can use this plugin from a different directory
const jest = requireResolve('jest') as typeof jestModule;
const jestConfig = requireResolve('jest-config') as typeof jestConfigModule;

/**
 * Direct stubbing on jest is no longer possible since jest > 25
 */
class JestWrapper {
  public runCLI: typeof jestModule.runCLI = (...args) => {
    return jest.runCLI(...args);
  };
  public getVersion: typeof jestModule.getVersion = (...args) => {
    return jest.getVersion(...args);
  };

  public readInitialOptions: typeof jestConfigModule.readInitialOptions = (...args) => {
    return jestConfig.readInitialOptions(...args);
  };
}

export const jestWrapper = new JestWrapper();
