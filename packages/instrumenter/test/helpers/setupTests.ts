import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import chaiJestSnapshot from 'chai-jest-snapshot';

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiJestSnapshot);

afterEach(() => {
  sinon.restore();
  testInjector.reset();
});

before(() => {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
  chaiJestSnapshot.setFilename(this.currentTest!.file!.replace('\\dist', '') + '.snap');
});
