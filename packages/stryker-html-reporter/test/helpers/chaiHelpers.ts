import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

(<any>chai).Assertion.addMethod('equalData', function (expected: any) {
  let actual = this._obj;
  for (let i in expected) {
    this.assert(expected[i] === actual[i],
      `expected #{this} to at least contain the field "${i}" with value "${expected[i]}", but was "${actual[i]}"`,
      `expected #{this} to not contain the field "${i}" with value "${expected[i]}", but it did.`);
  }
});

chai.use(chaiAsPromised);
chai.use(sinonChai);
