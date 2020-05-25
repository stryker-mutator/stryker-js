import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import * as sinon from 'sinon';
import 'source-map-support/register';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  before() {
    console.log('BEFORE ALL!');
  },
  afterEach() {
    sinon.restore();
    testInjector.reset();
  },
};
