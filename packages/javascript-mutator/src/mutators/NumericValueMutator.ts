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
      [0, 1, -1].forEach(v => {
        nodes.push(NodeGenerator.createAnyLiteralValueNode(node, 'NumericLiteral', v));
      });
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' }));
      nodes.push(
        NodeGenerator.createMutatedNode(node, 'UnaryExpression', {
          operator: '-',
          argument: NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' })
        })
      );
    }

    if (
      // check for -Infinity value expression
      types.isUnaryExpression(node) &&
      node.operator === '-' &&
      types.isIdentifier(node.argument) &&
      node.argument.name === 'Infinity'
    ) {
      [0, 1, -1].forEach(v => {
        nodes.push(NodeGenerator.createAnyLiteralValueNode(node, 'NumericLiteral', v));
      });
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' }));
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'NaN' }));
    }

    if (
      // check for identifier with (positive) Infinity value
      types.isIdentifier(node) &&
      node.name === 'Infinity' &&
      // should not be part of a negated numeric literal value expression,
      // which is already handled above
      !(types.isUnaryExpression(node.parent) && node.parent.operator === '-')
    ) {
      [0, 1, -1].forEach(v => {
        nodes.push(NodeGenerator.createAnyLiteralValueNode(node, 'NumericLiteral', v));
      });
      nodes.push(
        NodeGenerator.createMutatedNode(node, 'UnaryExpression', {
          operator: '-',
          argument: NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' })
        })
      );
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'NaN' }));
    }

    if (
      // check for identifier with NaN value
      types.isIdentifier(node) &&
      node.name === 'NaN' &&
      // should not be part of a negated numeric literal value expression,
      // which is already handled above
      !(types.isUnaryExpression(node.parent) && node.parent.operator === '-')
    ) {
      [0, 1, -1].forEach(v => {
        nodes.push(NodeGenerator.createAnyLiteralValueNode(node, 'NumericLiteral', v));
      });
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' }));
      nodes.push(
        NodeGenerator.createMutatedNode(node, 'UnaryExpression', {
          operator: '-',
          argument: NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' })
        })
      );
    }

    if (
      // check for negated numeric literal value expression
      types.isUnaryExpression(node) &&
      node.operator === '-' &&
      types.isNumericLiteral(node.argument)
    ) {
      const argument = node.argument;
      [0, 1, -1].forEach(v => {
        if (argument.value !== -v) {
          nodes.push(NodeGenerator.createAnyLiteralValueNode(node, 'NumericLiteral', v));
        }
      });
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' }));
      nodes.push(
        NodeGenerator.createMutatedNode(node, 'UnaryExpression', {
          operator: '-',
          argument: NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' })
        })
      );
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'NaN' }));
    }

    if (
      // non-negated numeric literal value
      types.isNumericLiteral(node) &&
      // should not be part of a negated numeric literal value expression,
      // which is already handled above
      !(types.isUnaryExpression(node.parent) && node.parent.operator === '-')
    ) {
      [0, 1, -1].forEach(v => {
        const mutatedNode = copy(node);
        if (mutatedNode.value !== v) {
          mutatedNode.value = v;
          nodes.push(mutatedNode);
        }
      });
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' }));
      nodes.push(
        NodeGenerator.createMutatedNode(node, 'UnaryExpression', {
          operator: '-',
          argument: NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'Infinity' })
        })
      );
      nodes.push(NodeGenerator.createMutatedNode(node, 'Identifier', { name: 'NaN' }));
    }

    return nodes;
  }
}
