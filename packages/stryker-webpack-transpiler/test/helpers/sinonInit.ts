import * as sinon from 'sinon';
import { testInjector } from '../../../stryker-test-helpers/src';

afterEach(() => {
  sinon.restore();
  testInjector.reset();
});
