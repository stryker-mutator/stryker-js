import { expect } from 'chai';

import { BooleanLiteralMutator } from '../../../src/mutators/boolean-literal-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

describe(BooleanLiteralMutator.name, () => {
  let sut: BooleanLiteralMutator;
  beforeEach(() => {
    sut = new BooleanLiteralMutator();
  });

  it('should have name "BooleanLiteral"', () => {
    expect(sut.name).eq('BooleanLiteral');
  });

  it('should mutate `true` into `false`', () => {
    expectJSMutation(sut, 'true', 'false');
  });

  it('should mutate `false` into `true`', () => {
    expectJSMutation(sut, 'false', 'true');
  });

  it('should mutate !a to a', () => {
    expectJSMutation(sut, '!a', 'a');
  });
});
