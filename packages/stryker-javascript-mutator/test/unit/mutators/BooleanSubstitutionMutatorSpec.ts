import BooleanSubstitutionMutator from '../../../src/mutators/BooleanSubstitutionMutator';
import { expectMutation } from '../../helpers/mutatorAssertions';
import JavaScriptMutator from '../../../src/JavaScriptMutator';
import { Config } from 'stryker-api/config';
import LogMock from '../../helpers/LogMock';
import * as log4js from 'log4js';

describe('BooleanSubstitutionMutator', () => {
  let mutator: JavaScriptMutator;

  beforeEach(() => {
    sandbox.stub(log4js, 'getLogger').returns(new LogMock());
    mutator = new JavaScriptMutator(new Config(), [new BooleanSubstitutionMutator()]);
  });

  it('should remove a unary "!"', () => {
    expectMutation(mutator, '!(1 > 2)', '1 > 2');
    expectMutation(mutator, '!a', 'a');
    expectMutation(mutator, '"!a"'); // leave alone any other `!` 
  });

  it('should mutate `true` into `false`', () => {
    expectMutation(mutator, 'true', 'false');
  });

  it('should mutate `false` into `true`', () => {
    expectMutation(mutator, 'false', 'true');
  });
});