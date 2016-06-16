import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

(<any>chai.Assertion).addMethod('equalData', function (expected: any) {
  var actual = this._obj;
  for(var i in expected){
    this.assert(expected[i] === actual[i], 
    `expected #{this} to at least contain the field "${i}" with value "${expected[i]}", but was "${actual[i]}"`,
    `expected #{this} to not contain the field "${i}" with value "${expected[i]}", but it did.`)
  }
});

chai.use(chaiAsPromised);
