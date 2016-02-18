'use strict';

var expect = require('chai').expect;
import MathMutation from '../../src/mutations/MathMutation';
var MutationRegistry = require('../../src/MutationRegistry');

describe('MutationRegistry', function() {
  var mutationRegistry;

  beforeEach(function() {
    mutationRegistry = new MutationRegistry();
  });

  it('should contain mutations', function() {
    var mutations = mutationRegistry.getAllMutations();

    expect(mutations.length).to.be.greaterThan(0);
  });

  it('should throw an error if a mutation was requested but no name was provided', function() {
    expect(mutationRegistry.getMutation).to.throw(Error);
  });

  it('should return undefined if a mutation could not be found', function() {
    var mutation = mutationRegistry.getMutation('The name of some mutation which should never exist');

    expect(mutation).to.equal(undefined);
  });

  it('should contain the MathMutation', function() {
    var expectedMutationName = new MathMutation().getName();

    var mathMutation = mutationRegistry.getMutation(expectedMutationName);

    expect(mathMutation.getName()).to.equal(expectedMutationName);
  });
});
