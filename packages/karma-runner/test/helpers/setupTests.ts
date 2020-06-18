import 'source-map-support/register';
import { testInjector } from '@stryker-mutator/test-helpers';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

import sinon = require('sinon');

chai.use(sinonChai);
chai.use(chaiAsPromised);

/**
 * During integration testing we're creating many karma instances.
 * Each instance of karma wants to register a SIGINT and SIGTERM handlers.
 * We want them to allow doing so, since that will make sure browsers are closed when the integration test process is closed
 */
process.setMaxListeners(40);

export const mochaHooks = {
  afterEach() {
    testInjector.reset();
    sinon.restore();
  },
};
