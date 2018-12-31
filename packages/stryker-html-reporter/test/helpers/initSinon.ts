import * as sinon from 'sinon';
import { TestInjector } from '@stryker-mutator/test-helpers';

afterEach(() => {
  sinon.restore();
  TestInjector.reset();
});
