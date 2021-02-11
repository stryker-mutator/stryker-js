import sinon from 'sinon';
import { NodePath, parseSync, types } from '@babel/core';
import { expect } from 'chai';

import { placeMutants, MutantPlacer } from '../../../src/mutant-placers';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers';
import { createMutant } from '../../helpers/factories';

describe(placeMutants.name, () => {
  let mutantPlacers: Array<sinon.SinonStubbedMember<MutantPlacer>>;
  let path: NodePath;

  beforeEach(() => {
    mutantPlacers = [sinon.stub(), sinon.stub()];
    path = findNodePath(parseJS('f = 0'), (p) => p.isProgram());
  });

  it('should not place mutants when the mutant array is empty', () => {
    const actual = placeMutants(path, [], 'foo.js', mutantPlacers);
    expect(actual).false;
    expect(mutantPlacers[0]).not.called;
    expect(mutantPlacers[1]).not.called;
  });

  it('should stop placing mutants if the first mutant placer could place it', () => {
    mutantPlacers[0].returns(true);
    const mutants = [createMutant()];
    const actual = placeMutants(path, mutants, 'foo.js', mutantPlacers);
    expect(actual).true;
    expect(mutantPlacers[0]).calledWith(path, mutants);
    expect(mutantPlacers[1]).not.called;
  });

  it('should return false if mutants could not be placed', () => {
    mutantPlacers[0].returns(false);
    mutantPlacers[1].returns(false);
    const mutants = [createMutant()];
    const actual = placeMutants(path, mutants, 'foo.js', mutantPlacers);
    expect(actual).false;
    expect(mutantPlacers[0]).calledWith(path, mutants);
    expect(mutantPlacers[1]).calledWith(path, mutants);
  });

  it('should throw an error if mutant placing gave a error', () => {
    const expectedError = new Error('expectedError');
    const fooPlacer: MutantPlacer = () => {
      throw expectedError;
    };
    path.node.loc = { start: { column: 3, line: 2 }, end: { column: 5, line: 4 } };
    mutantPlacers[0].throws(expectedError);
    const mutants = [createMutant()];
    expect(() => placeMutants(path, mutants, 'foo.js', [fooPlacer])).throws(
      SyntaxError,
      'foo.js:2:3 fooPlacer could not place mutants with type(s): "fooMutator". Either remove this file from the list of files to be mutated, or ignore the mutators. Please report this issue at https://github.com/stryker-mutator/stryker/issues/new'
    );
  });

  /**
   * Create a node path _without using the `new File` workaround_ defined here: https://github.com/babel/babel/issues/11889
   * This will make sure `buildCodeFrameError` fails.
   * This also happens in normal flows when complex babel transpilation is happening.
   * @see https://github.com/stryker-mutator/stryker/issues/2695
   */
  it('should throw a generic error if `buildCodeFrameError` fails (#2695)', () => {
    // Arrange
    const nodePath = findNodePath(parseSync('const a = b') as types.File, (p) => p.isProgram());
    const expectedError = new Error('expectedError');
    const fooPlacer: MutantPlacer = () => {
      throw expectedError;
    };
    mutantPlacers[0].throws(expectedError);
    const mutants = [createMutant()];

    // Arrange & Act
    expect(() => placeMutants(nodePath, mutants, 'foo.js', [fooPlacer])).throws(
      Error,
      'foo.js:1:0 fooPlacer could not place mutants with type(s): "fooMutator". Either remove this file from the list of files to be mutated, or ignore the mutators. Please report this issue at https://github.com/stryker-mutator/stryker/issues/new'
    );
  });
});
