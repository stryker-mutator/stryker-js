'use strict';

var _ = require('lodash');
import BaseMutation from './mutations/BaseMutation';
import ConditionalBoundayMutation from './mutations/ConditionalBoundayMutation';
import MathMutation from './mutations/MathMutation';
import RemoveConditionalsMutation from './mutations/RemoveConditionalsMutation';
import ReverseConditionalMutation from './mutations/ReverseConditionalMutation';
import TypeUtils from './utils/TypeUtils';
import UnaryOperatorMutation from './mutations/UnaryOperatorMutation';


export default class MutationRegistry {

  mutations: BaseMutation[];
  /**
   * Represents a provider for all types of mutations.
   * @constructor
   */
  constructor() {
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
   * @returns {BaseMutation[]} All supported Mutations.
   */
  getAllMutations(): BaseMutation[] {
    return this.mutations;
  };

  /**
   * Gets a specific Mutation.
   * @function
   * @param {String} name - The name of the Mutation
   * @returns {BaseMutation} The requested Mutation. Undefined if no Mutation with the provided name was found.
   */
  getMutation(name: string): BaseMutation {
    var index = _.findIndex(this.mutations, function(mutation: BaseMutation) {
      return mutation.getName() === name;
    });

    return this.mutations[index];
  }

}