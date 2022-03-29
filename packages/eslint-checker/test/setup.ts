import 'source-map-support/register.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

chai.use(sinonChai);
chai.use(chaiAsPromised);

let originalCwd: string;

export const mochaHooks = {
  beforeEach(): void {
    originalCwd = process.cwd();
  },

  afterEach(): void {
    sinon.restore();
    testInjector.reset();
    process.chdir(originalCwd);
  },
};
