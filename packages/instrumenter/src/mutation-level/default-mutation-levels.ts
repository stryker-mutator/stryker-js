import { MutationLevel } from './mutation-level.js';

const Level1: MutationLevel = {
  name: 'Level1',
  UpdateOperator: ['PrefixDecrementOperatorNegation'],
  EqualityOperator: [
    'LessThanEqualOperatorNegation',
    'LessThanEqualOperatorBoundary',
    'EqualityOperatorNegation',
    'InequalityOperatorNegation',
    'GreaterThanEqualOperatorNegation',
  ],
  ArrayDeclaration: ['ArrayConstructorItemsRemoval'],
  ConditionalExpression: ['BooleanExpressionToFalseReplacement', 'BooleanExpressionToTrueReplacement'],
  UnaryOperator: ['UnaryPlusOperatorNegation'],
  AssignmentOperator: ['NullishCoalescingAssignmentToLogicalAndReplacement'],
  ArithmeticOperator: ['DivisionOperatorNegation', 'RemainderOperatorToMultiplicationReplacement', 'MultiplicationOperatorNegation'],
  OptionalChaining: ['OptionalCallExpressionOptionalRemoval', 'OptionalMemberExpressionOptionalRemoval'],
};

const Level2: MutationLevel = {
  ...Level1,
  name: 'Level2',
  UpdateOperator: [...(Level1.UpdateOperator ?? []), 'PostfixIncrementOperatorNegation'],
  EqualityOperator: [
    ...(Level1.EqualityOperator ?? []),
    'LessThanOperatorNegation',
    'GreaterThanEqualOperatorBoundary',
    'StrictInequalityOperatorNegation',
    'GreaterThanOperatorBoundary',
  ],
  ConditionalExpression: [...(Level1.ConditionalExpression ?? []), 'SwitchStatementBodyRemoval'],
  ArithmeticOperator: [...(Level1.ArithmeticOperator ?? []), 'AdditionOperatorNegation', 'SubtractionOperatorNegation'],
  StringLiteral: ['EmptyStringLiteralToFilledReplacement', 'EmptyInterpolatedStringToFilledReplacement'],
  Regex: ['RegexRemoval'],
  BooleanLiteral: ['TrueLiteralNegation'],
};

const Level3: MutationLevel = {
  ...Level2,
  name: 'Level3',
  EqualityOperator: [...(Level2.EqualityOperator ?? []), 'LessThanOperatorBoundary', 'GreaterThanOperatorNegation'],
  ArrayDeclaration: [...(Level2.ArrayDeclaration ?? []), 'ArrayLiteralItemsRemoval', 'ArrayLiteralItemsFill'],
  UnaryOperator: [...(Level2.UnaryOperator ?? []), 'UnaryMinOperatorNegation'],
  BooleanLiteral: [...(Level2.BooleanLiteral ?? []), 'FalseLiteralNegation', 'LogicalNotRemoval'],
};

export const defaultMutationLevels: MutationLevel[] = [Level1, Level2, Level3];
