import fs from 'fs';

import {
  ArithmeticOperator,
  ArrayDeclaration,
  ArrowFunction,
  AssignmentOperator,
  BlockStatement,
  BooleanLiteral,
  ConditionalExpression,
  EqualityOperator,
  MethodExpression,
  ObjectLiteralMutator,
  OptionalChaining,
  Regex,
  StringLiteral,
  UnaryOperator,
  UpdateOperator,
} from '@stryker-mutator/api/core';

export type MutationOperator = Record<string, { replacementOperator: any; mutatorName: string }>;

export interface MutationLevel {
  /**
   * Name of the mutation level.
   */
  name: string;
  ArithmeticOperator?: ArithmeticOperator[];
  ArrayDeclaration?: ArrayDeclaration[];
  AssignmentOperator?: AssignmentOperator[];
  ArrowFunction?: ArrowFunction[];
  BlockStatement?: BlockStatement[];
  BooleanLiteral?: BooleanLiteral[];
  ConditionalExpression?: ConditionalExpression[];
  EqualityOperator?: EqualityOperator[];
  MethodExpression?: MethodExpression[];
  ObjectLiteral?: ObjectLiteralMutator[];
  OptionalChaining?: OptionalChaining[];
  Regex?: Regex[];
  StringLiteral?: StringLiteral[];
  UnaryOperator?: UnaryOperator[];
  UpdateOperator?: UpdateOperator[];
  [k: string]: unknown;
}

export const defaultMutationLevels: MutationLevel[] = JSON.parse(
  fs.readFileSync(new URL('../../../src/mutation-level/default-mutation-levels.json', import.meta.url), 'utf-8'),
).mutationLevels;
