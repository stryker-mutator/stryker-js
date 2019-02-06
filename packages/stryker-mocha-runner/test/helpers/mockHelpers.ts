import * as sinon from 'sinon';
import { RunnerOptions } from 'stryker-api/test_runner';
import { factory } from '@stryker-mutator/test-helpers';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export function mock<T>(constructorFn: new (...args: any[]) => T): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

export const runnerOptions = factoryMethod<RunnerOptions>(() => ({
  fileNames: ['src/math.js', 'test/mathSpec.js'],
  strykerOptions: factory.strykerOptions({ mochaOptions: {} })
}));

function factoryMethod<T>(defaults: () => T): (overrides?: Partial<T>) => T {
  return (overrides?: Partial<T>): T => {
    return Object.assign(defaults(), overrides);
  };
}
