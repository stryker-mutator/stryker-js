import * as sinon from 'sinon';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';

afterEach(() => {
  sinon.restore();
  TEST_INJECTOR.reset();
});
