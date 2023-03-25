import { arithmeticOperatorMutator } from './arithmetic-operator-mutator.js';
import { NodeMutator } from './node-mutator.js';
import { blockStatementMutator } from './block-statement-mutator.js';
import { conditionalExpressionMutator } from './conditional-expression-mutator.js';
import { stringLiteralMutator } from './string-literal-mutator.js';
import { arrayDeclarationMutator } from './array-declaration-mutator.js';
import { arrowFunctionMutator } from './arrow-function-mutator.js';
import { booleanLiteralMutator } from './boolean-literal-mutator.js';
import { equalityOperatorMutator } from './equality-operator-mutator.js';
import { methodExpressionMutator } from './method-expression-mutator.js';
import { logicalOperatorMutator } from './logical-operator-mutator.js';
import { objectLiteralMutator } from './object-literal-mutator.js';
import { unaryOperatorMutator } from './unary-operator-mutator.js';
import { updateOperatorMutator } from './update-operator-mutator.js';
import { regexMutator } from './regex-mutator.js';
import { optionalChainingMutator } from './optional-chaining-mutator.js';
import { assignmentOperatorMutator } from './assignment-operator-mutator.js';

export const allMutators: NodeMutator[] = [
  arithmeticOperatorMutator,
  arrayDeclarationMutator,
  arrowFunctionMutator,
  blockStatementMutator,
  booleanLiteralMutator,
  conditionalExpressionMutator,
  equalityOperatorMutator,
  logicalOperatorMutator,
  methodExpressionMutator,
  objectLiteralMutator,
  stringLiteralMutator,
  unaryOperatorMutator,
  updateOperatorMutator,
  regexMutator,
  optionalChainingMutator,
  assignmentOperatorMutator,
];
