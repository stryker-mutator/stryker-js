import { Node } from '@babel/core';
import {
  ArithmeticOperator,
  ArrayDeclaration,
  ArrowFunction,
  AssignmentOperator,
  BlockStatement,
  BooleanLiteral,
  ConditionalExpression,
  EqualityOperator,
  LogicalOperator,
  MethodExpression,
  MutatorDefinition,
  ObjectLiteral,
  OptionalChaining,
  Regex,
  StringLiteral,
  UnaryOperator,
  UpdateOperator,
} from '@stryker-mutator/api/core';

/**
 * A Record that maps a replaceable fragment of code to a ReplacementConfiguration.
 */
export type NodeMutatorConfiguration<T> = Record<string, ReplacementConfiguration<T>>;

/**
 * Consists of a replacement, or none if it removes the fragment; and a name for the mutation.
 */
interface ReplacementConfiguration<T> {
  /**
   * Replacement for the fragment of code. ``undefined`` signifies removal of the fragment.
   */
  replacement?: Node | Node[] | boolean | string | null;
  /**
   * Name of the mutation.
   */
  mutationOperator: T;
}

/**
 * Mutation Level. Has a name, and optionally a list of allowed mutations grouped per node type.
 */
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
  LogicalOperator?: LogicalOperator[];
  MethodExpression?: MethodExpression[];
  ObjectLiteral?: ObjectLiteral[];
  OptionalChaining?: OptionalChaining[];
  Regex?: Regex[];
  StringLiteral?: StringLiteral[];
  UnaryOperator?: UnaryOperator[];
  UpdateOperator?: UpdateOperator[];
  [k: string]: MutatorDefinition[] | string | undefined;
}
