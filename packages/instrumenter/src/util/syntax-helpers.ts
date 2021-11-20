import { INSTRUMENTER_CONSTANTS as ID } from '@stryker-mutator/api/core';
import { types, NodePath } from '@babel/core';
import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
import { deepFreeze } from '@stryker-mutator/util';

import { Mutant } from '../mutant';

export { ID };

const STRYKER_NAMESPACE_HELPER = 'stryNS_9fa48';
const COVER_MUTANT_HELPER = 'stryCov_9fa48';
const IS_MUTANT_ACTIVE_HELPER = 'stryMutAct_9fa48';

/**
 * Returns syntax for the header if JS/TS files
 */
export const instrumentationBabelHeader = deepFreeze(
  parse(`function ${STRYKER_NAMESPACE_HELPER}(){
  var g = new Function("return this")();
  var ns = g.${ID.NAMESPACE} || (g.${ID.NAMESPACE} = {});
  if (ns.${ID.ACTIVE_MUTANT} === undefined && g.process && g.process.env && g.process.env.${ID.ACTIVE_MUTANT_ENV_VARIABLE}) {
    ns.${ID.ACTIVE_MUTANT} = g.process.env.${ID.ACTIVE_MUTANT_ENV_VARIABLE};
  }
  function retrieveNS(){
    return ns;
  }
  ${STRYKER_NAMESPACE_HELPER} = retrieveNS;
  return retrieveNS();
}
${STRYKER_NAMESPACE_HELPER}();

function ${COVER_MUTANT_HELPER}() {
  var ns = ${STRYKER_NAMESPACE_HELPER}();
  var cov = ns.${ID.MUTATION_COVERAGE_OBJECT} || (ns.${ID.MUTATION_COVERAGE_OBJECT} = { static: {}, perTest: {} });
  function cover() {
    var c = cov.static;
    if (ns.${ID.CURRENT_TEST_ID}) {
      c = cov.perTest[ns.${ID.CURRENT_TEST_ID}] = cov.perTest[ns.${ID.CURRENT_TEST_ID}] || {};
    }
    var a = arguments;
    for(var i=0; i < a.length; i++){
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  ${COVER_MUTANT_HELPER} = cover;
  cover.apply(null, arguments);
}
function ${IS_MUTANT_ACTIVE_HELPER}(id) {
  var ns = ${STRYKER_NAMESPACE_HELPER}();
  function isActive(id) {
    if (ns.${ID.ACTIVE_MUTANT} === id) {
      if (ns.${ID.HIT_COUNT} !== void 0 && ++ns.${ID.HIT_COUNT} > ns.${ID.HIT_LIMIT}) {
        throw new Error('Stryker: Hit count limit reached (' + ns.${ID.HIT_COUNT} + ')');
      }
      return true;
    }
    return false;
  }
  ${IS_MUTANT_ACTIVE_HELPER} = isActive;
  return isActive(id);
}`).program.body
) as readonly types.Statement[]; // cast here, otherwise the thing gets unwieldy to handle

/**
 * returns syntax for `global.activeMutant === $mutantId`
 * @param mutantId The id of the mutant to switch
 */
export function mutantTestExpression(mutantId: string): types.CallExpression {
  return types.callExpression(types.identifier(IS_MUTANT_ACTIVE_HELPER), [types.stringLiteral(mutantId)]);
}

interface Position {
  line: number;
  column: number;
}

function eqLocation(a: types.SourceLocation, b: types.SourceLocation): boolean {
  function eqPosition(start: Position, end: Position): boolean {
    return start.column === end.column && start.line === end.line;
  }
  return eqPosition(a.start, b.start) && eqPosition(a.end, b.end);
}

export function eqNode<T extends types.Node>(a: T, b: types.Node): b is T {
  return a.type === b.type && !!a.loc && !!b.loc && eqLocation(a.loc, b.loc);
}

export function offsetLocations(file: types.File, { position, line, column }: { position: number; line: number; column: number }): void {
  const offsetNode = (node: types.Node): void => {
    node.start! += position;
    node.end! += position;
    //  we need to subtract 1, as lines always start at 1
    node.loc!.start.line += line - 1;
    node.loc!.end.line += line - 1;
    if (node.loc!.start.line === line) {
      node.loc!.start.column += column;
    }
    if (node.loc!.end.line === line) {
      node.loc!.end.column += column;
    }
  };
  traverse(file, {
    enter(path) {
      offsetNode(path.node);
    },
  });
  // Don't forget the file itself!
  file.start! += position;
  file.end! += position;
}

/**
 * Returns a sequence of mutation coverage counters with an optional last expression.
 *
 * @example (global.__coverMutant__(0, 1), 40 + 2)
 * @param mutants The mutants for which covering syntax needs to be generated
 * @param targetExpression The original expression
 */
export function mutationCoverageSequenceExpression(mutants: Iterable<Mutant>, targetExpression?: types.Expression): types.Expression {
  const mutantIds = [...mutants].map((mutant) => types.stringLiteral(mutant.id));
  const sequence: types.Expression[] = [types.callExpression(types.identifier(COVER_MUTANT_HELPER), mutantIds)];
  if (targetExpression) {
    sequence.push(targetExpression);
  }
  return types.sequenceExpression(sequence);
}

export function isTypeNode(path: NodePath): boolean {
  return (
    path.isTypeAnnotation() ||
    flowTypeAnnotationNodeTypes.includes(path.node.type) ||
    tsTypeAnnotationNodeTypes.includes(path.node.type) ||
    isDeclareVariableStatement(path) ||
    isDeclareModule(path)
  );
}

/**
 * Determines whether or not it is a declare variable statement node.
 * @example
 * declare const foo: 'foo';
 */
function isDeclareVariableStatement(path: NodePath): boolean {
  return path.isVariableDeclaration() && path.node.declare === true;
}

/**
 * Determines whether or not a node is a string literal that is the name of a module.
 * @example
 * declare module "express" {};
 */
function isDeclareModule(path: NodePath): boolean {
  return path.isTSModuleDeclaration() && (path.node.declare ?? false);
}

const tsTypeAnnotationNodeTypes: ReadonlyArray<types.Node['type']> = Object.freeze([
  'TSAsExpression',
  'TSInterfaceDeclaration',
  'TSTypeAnnotation',
  'TSTypeAliasDeclaration',
  'TSEnumDeclaration',
  'TSDeclareFunction',
  'TSTypeParameterInstantiation',
  'TSTypeParameterDeclaration',
]);

const flowTypeAnnotationNodeTypes: ReadonlyArray<types.Node['type']> = Object.freeze([
  'DeclareClass',
  'DeclareFunction',
  'DeclareInterface',
  'DeclareModule',
  'DeclareModuleExports',
  'DeclareTypeAlias',
  'DeclareOpaqueType',
  'DeclareVariable',
  'DeclareExportDeclaration',
  'DeclareExportAllDeclaration',
  'InterfaceDeclaration',
  'OpaqueType',
  'TypeAlias',
  'InterfaceDeclaration',
]);

export function isImportDeclaration(path: NodePath): boolean {
  return types.isTSImportEqualsDeclaration(path.node) || path.isImportDeclaration();
}

/**
 * Determines if a location (needle) is included in an other location (haystack)
 * @param haystack The range to look in
 * @param needle the range to search for
 */
export function locationIncluded(haystack: types.SourceLocation, needle: types.SourceLocation): boolean {
  const startIncluded =
    haystack.start.line < needle.start.line || (haystack.start.line === needle.start.line && haystack.start.column <= needle.start.column);
  const endIncluded = haystack.end.line > needle.end.line || (haystack.end.line === needle.end.line && haystack.end.column >= needle.end.column);
  return startIncluded && endIncluded;
}

/**
 * Determines if two locations overlap with each other
 */
export function locationOverlaps(a: types.SourceLocation, b: types.SourceLocation): boolean {
  const startIncluded = a.start.line < b.end.line || (a.start.line === b.end.line && a.start.column <= b.end.column);
  const endIncluded = a.end.line > b.start.line || (a.end.line === b.start.line && a.end.column >= b.start.column);
  return startIncluded && endIncluded;
}

/**
 * Helper for `types.cloneNode(node, deep: true, withoutLocations: false);`
 */
export function deepCloneNode<TNode extends types.Node>(node: TNode): TNode {
  return types.cloneNode(node, /* deep */ true, /* withoutLocations */ false);
}
