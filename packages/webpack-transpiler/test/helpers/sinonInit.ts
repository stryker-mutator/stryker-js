import * as sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

afterEach(() => {
  sinon.restore();
  testInjector.reset();
});
