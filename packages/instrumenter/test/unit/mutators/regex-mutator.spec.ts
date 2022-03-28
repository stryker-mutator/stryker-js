import { expect } from 'chai';
import sinon from 'sinon';
import weaponRegex from 'weapon-regex';

import { regexMutator as sut } from '../../../src/mutators/regex-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
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
    // Arrange
    const weaponRegexStub = sinon.stub(weaponRegex, 'mutate');
    weaponRegexStub.throws(new Error('[Error] Parser: Position 1:1, found "[[]]"'));
    const errorStub = sinon.stub(console, 'error');

    // Act
    expectJSMutation(sut, '/[[]]/');

    // Assert
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
