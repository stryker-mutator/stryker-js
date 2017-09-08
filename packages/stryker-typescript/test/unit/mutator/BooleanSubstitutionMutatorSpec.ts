import BooleanSubstitutionMutator from '../../../src/mutator/BooleanSubstitutionMutator';
import { expect } from 'chai';
import { expectMutation } from './mutatorAssertions';

describe('BooleanSubstitutionMutator', () => {
  let sut: BooleanSubstitutionMutator;

  beforeEach(() => {
    sut = new BooleanSubstitutionMutator();
  });

  it('should have name "BooleanSubstitution"', () => {
    expect(sut.name).eq('BooleanSubstitution');
  });

  it('should mutate `true` into `false`', () => {
    expectMutation(sut, 'true', 'false');
  });

  it('should mutate `false` into `true`', () => {
    expectMutation(sut, 'false', 'true');
  });
});