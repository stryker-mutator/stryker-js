'use strict';

var _ = require('lodash');
import ConditionalBoundayMutation from './mutations/ConditionalBoundayMutation';
import MathMutation from './mutations/MathMutation';
var RemoveConditionalsMutation = require('./mutations/RemoveConditionalsMutation');
var ReverseConditionalMutation = require('./mutations/ReverseConditionalMutation');
import TypeUtils from './utils/TypeUtils';
var UnaryOperatorMutation = require('./mutations/UnaryOperatorMutation');

/**
 * Represents a provider for all types of mutations.
 * @constructor
 */
function MutationRegistry() {
  this._typeUtils = new TypeUtils();
  this.mutations = [
    new ConditionalBoundayMutation(),
    new MathMutation(),
    new RemoveConditionalsMutation(),
    new ReverseConditionalMutation(),
    new UnaryOperatorMutation()
  ];
}

/**
 * Gets all supported Mutations.
 * @function
 * @returns {Mutation[]} All supported Mutations.
 */
MutationRegistry.prototype.getAllMutations = function() {
  return this.mutations;
};

/**
 * Gets a specific Mutation.
 * @function
 * @param {String} name - The name of the Mutation
 * @returns {Mutation} The requested Mutation. Undefined if no Mutation with the provided name was found.
 */
MutationRegistry.prototype.getMutation = function(name) {
  this._typeUtils.expectParameterString(name, 'MutationRegistry', 'name');

  var index = _.findIndex(this.mutations, function(mutation) {
    return mutation.getName() === name;
  });

  return this.mutations[index];
};

module.exports = MutationRegistry;
