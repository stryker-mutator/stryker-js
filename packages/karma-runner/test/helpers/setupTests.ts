import 'source-map-support/register';
import { testInjector } from '@stryker-mutator/test-helpers';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

import sinon = require('sinon');

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  afterEach() {
    testInjector.reset();
    sinon.restore();
  },
};
