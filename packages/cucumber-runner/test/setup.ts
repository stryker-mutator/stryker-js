import 'source-map-support/register';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import StrykerFormatter from '../src/stryker-formatter';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const cwd = process.cwd();

export const mochaHooks = {
  afterEach(): void {
    if (process.cwd() !== cwd) {
      process.chdir(cwd);
    }
    sinon.restore();
    testInjector.reset();
    StrykerFormatter.instance = undefined;
    delete global.__stryker2__;
  },
};
