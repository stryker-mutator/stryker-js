import { arithmeticOperatorMutator } from './arithmetic-operator-mutator';
import { NodeMutator } from './node-mutator';
import { blockStatementMutator } from './block-statement-mutator';
import { conditionalExpressionMutator } from './conditional-expression-mutator';
import { stringLiteralMutator } from './string-literal-mutator';
import { arrayDeclarationMutator } from './array-declaration-mutator';
import { arrowFunctionMutator } from './arrow-function-mutator';
import { booleanLiteralMutator } from './boolean-literal-mutator';
import { equalityOperatorMutator } from './equality-operator-mutator';
import { logicalOperatorMutator } from './logical-operator-mutator';
import { objectLiteralMutator } from './object-literal-mutator';
import { unaryOperatorMutator } from './unary-operator-mutator';
import { updateOperatorMutator } from './update-operator-mutator';
import { regexMutator } from './regex-mutator';
import { optionalChainingMutator } from './optional-chaining-mutator';

export const allMutators: NodeMutator[] = [
  arithmeticOperatorMutator,
  arrayDeclarationMutator,
  arrowFunctionMutator,
  blockStatementMutator,
  booleanLiteralMutator,
  conditionalExpressionMutator,
  equalityOperatorMutator,
  logicalOperatorMutator,
  objectLiteralMutator,
  stringLiteralMutator,
  unaryOperatorMutator,
  updateOperatorMutator,
  regexMutator,
  optionalChainingMutator,
];
