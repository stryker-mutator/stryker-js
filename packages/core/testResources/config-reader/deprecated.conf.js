module.exports = {
  mutator: {
    name: 'javascript',
    excludedMutations: [
      'ArrayLiteral',
      'ArrayNewExpression',
      'BinaryExpression',
      'Block',
      'BooleanSubstitution',
      'DoStatement',
      'ForStatement',
      'IfStatement',
      'PrefixUnaryExpression',
      'PostfixUnaryExpression',
      'SwitchCase',
      'WhileStatement',
      'ObjectLiteral',
      'ArrowFunctionMutator'
    ]
  }
}
