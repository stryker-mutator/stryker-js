import { expect } from 'chai';
import sinon from 'sinon';

import { regexMutator as sut } from '../../../src/mutators/regex-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "Regex"', () => {
    expect(sut.name).eq('Regex');
  });

  it('should not mutate normal string literals', () => {
    expectJSMutation(sut, '""', { isExpressionContext: false });
  });

  it('should mutate a regex literal', () => {
    expectJSMutation(
      sut,
      '/\\d{4}/',
      { isExpressionContext: false },
      '/\\d/',
      '/\\D{4}/',
    );
  });

  it("should not crash if a regex couldn't be parsed", () => {
    // Arrange
    const errorStub = sinon.stub(console, 'error');

    // Act
    expectJSMutation(sut, 'new RegExp("*(a|$]")', {
      isExpressionContext: false,
    });

    // Assert
    expect(errorStub).calledOnceWithExactly(
      sinon.match((value: string) =>
        value.startsWith(
          '[RegexMutator]: The Regex parser of weapon-regex couldn\'t parse this regex pattern: "*(a|$]". Please report this issue at https://github.com/stryker-mutator/weapon-regex/issues. Inner error: *(a|$]',
        ),
      ),
    );
  });

  it('should mutate obvious Regex string literals', () => {
    expectJSMutation(
      sut,
      'new RegExp("\\\\d{4}")',
      { isExpressionContext: false },
      'new RegExp("\\\\d")',
      'new RegExp("\\\\D{4}")',
    );
  });

  it('should not mutate the flags of a new RegExp constructor', () => {
    expectJSMutation(sut, 'new RegExp("", "\\\\d{4}")', {
      isExpressionContext: false,
    });
  });

  it('should not pass flags if no flags are defined', () => {
    expectJSMutation(sut, '/\\u{20}/', { isExpressionContext: false }, '/\\u/');
  });

  it('should pass flags in regex literals', () => {
    expectJSMutation(sut, '/\\u{20}/u', { isExpressionContext: false });
  });

  it('should pass flags in new RegExp constructors', () => {
    expectJSMutation(sut, 'new RegExp("\\\\u{20}", "u")', {
      isExpressionContext: false,
    });
  });

  it('should only pass flags in new RegExp constructors if it is a string literal', () => {
    expectJSMutation(
      sut,
      'new RegExp("\\\\u{20}", foo)',
      { isExpressionContext: false },
      'new RegExp("\\\\u", foo)',
    );
  });

  it('should not mutate to a regex that is invalid with the unicode flag', () => {
    expectJSMutation(sut, '/\\v/u', { isExpressionContext: false });
  });

  it('should not mutate to a regex that is invalid with the unicodeSets flag', () => {
    expectJSMutation(sut, '/\\v/v', { isExpressionContext: false });
  });

  it('should still mutate to regexes that are valid with the unicode flag', () => {
    expectJSMutation(
      sut,
      '/\\v{4}/u',
      { isExpressionContext: false },
      '/\\v/u',
    );
  });

  it('should still mutate to a regex that is invalid with the unicode flag without that flag', () => {
    expectJSMutation(sut, '/\\v/', { isExpressionContext: false }, '/\\V/');
  });

  it('should not mutate to a regex that is invalid with the flags of a new RegExp constructor', () => {
    expectJSMutation(sut, 'new RegExp("\\\\v", "u")', {
      isExpressionContext: false,
    });
  });
});
