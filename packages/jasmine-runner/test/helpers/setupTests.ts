import 'source-map-support/register';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import * as sinon from 'sinon';

chai.use(sinonChai);
chai.use(chaiAsPromised);

afterEach(() => {
  sinon.reset();
  testInjector.reset();
});
