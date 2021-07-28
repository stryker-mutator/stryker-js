import 'source-map-support/register';
import { testInjector } from '@stryker-mutator/test-helpers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';

import sinon from 'sinon';

import { StrykerReporter } from '../src/karma-plugins/stryker-reporter';

chai.use(sinonChai);
chai.use(chaiAsPromised);

/**
 * During integration testing we're creating many karma instances.
 * Each instance of karma wants to register a SIGINT and SIGTERM handlers.
 * We want them to allow doing so, since that will make sure browsers are closed when the integration test process is closed
 */
process.setMaxListeners(40);

export const mochaHooks = {
  afterEach(): void {
    testInjector.reset();
    sinon.restore();

    StrykerReporter.instance.karmaServer = undefined;
    StrykerReporter.instance.karmaConfig = undefined;
  },
};
