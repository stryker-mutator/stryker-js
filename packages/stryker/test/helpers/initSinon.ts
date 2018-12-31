import * as sinon from 'sinon';
import { TestInjector } from '../../../stryker-test-helpers/src';

afterEach(() => {
  sinon.restore();
  TestInjector.reset();
});
