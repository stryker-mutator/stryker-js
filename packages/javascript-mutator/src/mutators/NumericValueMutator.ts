import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';
import { NodeWithParent } from '../helpers/ParentNode';

import { NodeMutator } from './NodeMutator';

export default class NumericValueMutator implements NodeMutator {
  public name = 'NumericValue';

  public mutate(node: NodeWithParent, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (
      // check for -NaN value expression
      types.isUnaryExpression(node) &&
      node.operator === '-' &&
      types.isIdentifier(node.argument) &&
      node.argument.name === 'NaN'
    ) {
      NumericValueMutator.pushMutatedValueNodes(nodes, node, NaN);
    }

    if (
      // check for -Infinity value expression
      types.isUnaryExpression(node) &&
      node.operator === '-' &&
      types.isIdentifier(node.argument) &&
      node.argument.name === 'Infinity'
    ) {
      NumericValueMutator.pushMutatedValueNodes(nodes, node, -Infinity);
    }

    if (
      // check for identifier with (positive) Infinity value
      types.isIdentifier(node) &&
      node.name === 'Infinity' &&
      // should not be part of a negated numeric literal value expression,
      // which is already handled above
      !(types.isUnaryExpression(node.parent) && node.parent.operator === '-')
    ) {
      NumericValueMutator.pushMutatedValueNodes(nodes, node, Infinity);
    }

    if (
      // check for identifier with NaN value
      types.isIdentifier(node) &&
      node.name === 'NaN' &&
      // should not be part of a negated numeric literal value expression,
      // which is already handled above
      !(types.isUnaryExpression(node.parent) && node.parent.operator === '-')
    ) {
      NumericValueMutator.pushMutatedValueNodes(nodes, node, NaN);
    }

    if (
      // check for negated numeric literal value expression
      types.isUnaryExpression(node) &&
      node.operator === '-' &&
      types.isNumericLiteral(node.argument)
    ) {
      NumericValueMutator.pushMutatedValueNodes(nodes, node, -node.argument.value);
    }

    if (
      // non-negated numeric literal value
      types.isNumericLiteral(node) &&
      // should not be part of a negated numeric literal value expression,
      // which is already handled above
      !(types.isUnaryExpression(node.parent) && node.parent.operator === '-')
    ) {
      NumericValueMutator.pushMutatedValueNodes(nodes, node, node.value);
    }

    return nodes;
  }

  private static pushMutatedValueNodes(nodes: types.Node[], node: types.Node, value: number) {
    [0, 1, -1].forEach(v => {
      if (value !== v) {
        nodes.push(NodeGenerator.createAnyLiteralValueNode(node, 'NumericLiteral', v));
      }
    });

    if (value !== Infinity) {
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' }));
    }

    if (value !== -Infinity) {
      nodes.push(
        NodeGenerator.createMutatedNode(node, 'UnaryExpression', {
          operator: '-',
          argument: NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' })
        })
      );
    }

    // TBD Workaround since the condition (value === NaN)
    // does not seem to do what we want here
    // (value === NaN)
    if (!!value || value === 0) {
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'NaN' }));
    }
  }
}
