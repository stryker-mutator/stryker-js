import sinon from 'sinon';
import { NodePath } from '@babel/core';
import { expect } from 'chai';

import { placeMutant, MutantPlacer } from '../../../src/mutant-placers';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers';
import { createMutant } from '../../helpers/factories';

describe(placeMutant.name, () => {
  let mutantPlacers: Array<sinon.SinonStubbedMember<MutantPlacer>>;
  let path: NodePath;

  beforeEach(() => {
    mutantPlacers = [sinon.stub(), sinon.stub()];
    path = findNodePath(parseJS('f = 0'), (p) => p.isProgram());
  });

  it('should not place mutants when the mutant array is empty', () => {
    const actual = placeMutant(path, [], mutantPlacers);
    expect(actual).false;
    expect(mutantPlacers[0]).not.called;
    expect(mutantPlacers[1]).not.called;
  });

  it('should stop placing mutants if the first mutant placer could place it', () => {
    mutantPlacers[0].returns(true);
    const mutants = [createMutant()];
    const actual = placeMutant(path, mutants, mutantPlacers);
    expect(actual).true;
    expect(mutantPlacers[0]).calledWith(path, mutants);
    expect(mutantPlacers[1]).not.called;
  });

  it('should return false if mutants could not be placed', () => {
    mutantPlacers[0].returns(false);
    mutantPlacers[1].returns(false);
    const mutants = [createMutant()];
    const actual = placeMutant(path, mutants, mutantPlacers);
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
    expect(() => placeMutant(path, mutants, [fooPlacer])).throws(
      'Error while placing mutants of type(s) "fooMutator" on 2:3 with fooPlacer. Error: expectedError'
    );
  });
});
