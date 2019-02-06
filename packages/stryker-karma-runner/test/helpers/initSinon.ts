import * as sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

afterEach(() => {
  testInjector.reset();
  sinon.restore();
});
