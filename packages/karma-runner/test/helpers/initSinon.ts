import { testInjector } from '@stryker-mutator/test-helpers';
import * as sinon from 'sinon';

afterEach(() => {
  testInjector.reset();
  sinon.restore();
});
