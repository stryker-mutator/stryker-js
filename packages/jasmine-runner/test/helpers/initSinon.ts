import * as sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

afterEach(() => {
  sinon.reset();
  testInjector.reset();
});
