import { expect } from 'chai';
import sinon from 'sinon';

import { RegexMutator } from '../../../src/mutators/regex-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

describe(RegexMutator.name, () => {
  let sut: RegexMutator;
  beforeEach(() => {
    sut = new RegexMutator();
  });

  it('should have name "Regex"', () => {
    expect(sut.name).eq('Regex');
  });

  it('should not mutate normal string literals', () => {
    expectJSMutation(sut, '""');
  });

  it('should mutate a regex literal', () => {
    expectJSMutation(sut, '/\\d{4}/', '/\\d/', '/\\D{4}/');
  });

  it("should not crash if a regex couldn't be parsed", () => {
    const errorStub = sinon.stub(console, 'error');
    expectJSMutation(sut, '/[[]]/');
    expect(errorStub).calledWith(
      '[RegexMutator]: The Regex parser of weapon-regex couldn\'t parse this regex pattern: "[[]]". Please report this issue at https://github.com/stryker-mutator/weapon-regex/issues. Inner error: [Error] Parser: Position 1:1, found "[[]]"'
    );
  });

  it('should mutate obvious Regex string literals', () => {
    expectJSMutation(sut, 'new RegExp("\\\\d{4}")', 'new RegExp("\\\\d")', 'new RegExp("\\\\D{4}")');
  });

  it('should not mutate the flags of a new RegExp constructor', () => {
    expectJSMutation(sut, 'new RegExp("", "\\\\d{4}")');
  });
});
