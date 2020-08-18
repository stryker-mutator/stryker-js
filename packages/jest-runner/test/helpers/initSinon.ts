import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

afterEach(() => {
  sinon.restore();
  testInjector.reset();
});
