import sinon from 'sinon';
import { NodePath, parseSync, types } from '@babel/core';
import { expect } from 'chai';

import { throwPlacementError, MutantPlacer } from '../../../src/mutant-placers/index.js';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers.js';
import { createMutant } from '../../helpers/factories.js';

describe(throwPlacementError.name, () => {
  let path: NodePath;
  let fooPlacer: MutantPlacer<types.Statement>;

  beforeEach(() => {
    path = findNodePath(parseJS('f = 0'), (p) => p.isProgram());
    fooPlacer = {
      name: 'fooPlacer',
      canPlace: sinon.stub(),
      place: sinon.stub(),
    };
  });

  it('should throw an error if mutant placing gave a error', () => {
    const expectedError = new Error('expectedError');

    path.node.loc = { start: { column: 3, line: 2 }, end: { column: 5, line: 4 } };
    const mutants = [createMutant()];
    expect(() => throwPlacementError(expectedError, path, fooPlacer, mutants, 'foo.js')).throws(
      SyntaxError,
      'foo.js:2:3 fooPlacer could not place mutants with type(s): "fooMutator". Either remove this file from the list of files to be mutated, or exclude the mutator (using mutator.excludedMutations). Please report this issue at https://github.com/stryker-mutator/stryker-js/issues/new'
    );
  });

  /**
   * Create a node path _without using the `new File` workaround_ defined here: https://github.com/babel/babel/issues/11889
   * This will make sure `buildCodeFrameError` fails.
   * This also happens in normal flows when complex babel transpilation is happening.
   * @see https://github.com/stryker-mutator/stryker-js/issues/2695
   */
  it('should throw a generic error if `buildCodeFrameError` fails (#2695)', () => {
    // Arrange
    const nodePath = findNodePath(parseSync('const a = b') as types.File, (p) => p.isProgram());
    const expectedError = new Error('expectedError');
    const mutants = [createMutant()];

    // Arrange & Act
    expect(() => throwPlacementError(expectedError, nodePath, fooPlacer, mutants, 'foo.js')).throws(
      Error,
      'foo.js:1:0 fooPlacer could not place mutants with type(s): "fooMutator". Either remove this file from the list of files to be mutated, or exclude the mutator (using mutator.excludedMutations). Please report this issue at https://github.com/stryker-mutator/stryker-js/issues/new'
    );
  });
});
