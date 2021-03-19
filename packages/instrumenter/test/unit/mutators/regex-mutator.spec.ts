import { expect } from 'chai';
import sinon from 'sinon';

import { RegexMutator } from '../../../src/mutators/regex-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

describe(RegexMutator.name, () => {
  it('should have name "Regex"', () => {
    const sut = new RegexMutator();
    expect(sut.name).eq('Regex');
  });

  it('should not mutate normal string literals', () => {
    const sut = new RegexMutator();
    expectJSMutation(sut, '""');
  });

  it('should mutate a regex literal', () => {
    const sut = new RegexMutator();
    expectJSMutation(sut, '/\\d{4}/', '/\\d/', '/\\D{4}/');
  });

  it("should not crash if a regex couldn't be parsed", () => {
    // Arrange
    const weaponRegexStub = sinon.stub();
    weaponRegexStub.throws(new Error('[Error] Parser: Position 1:1, found "[[]]"'));
    const sut = new RegexMutator(weaponRegexStub);
    const errorStub = sinon.stub(console, 'error');

    // Act
    expectJSMutation(sut, '/[[]]/');

    // Assert
    expect(errorStub).calledWith(
      '[RegexMutator]: The Regex parser of weapon-regex couldn\'t parse this regex pattern: "[[]]". Please report this issue at https://github.com/stryker-mutator/weapon-regex/issues. Inner error: [Error] Parser: Position 1:1, found "[[]]"'
    );
  });

  it('should mutate obvious Regex string literals', () => {
    const sut = new RegexMutator();
    expectJSMutation(sut, 'new RegExp("\\\\d{4}")', 'new RegExp("\\\\d")', 'new RegExp("\\\\D{4}")');
  });

  it('should not mutate the flags of a new RegExp constructor', () => {
    const sut = new RegexMutator();
    expectJSMutation(sut, 'new RegExp("", "\\\\d{4}")');
  });
});
