import { types } from '@babel/core';
import traverse from '@babel/traverse';

// export const GLOBAL = '__global_69fa48';
// export const MUTATION_COVERAGE_OBJECT = '__mutationCoverage__';
// export const COVER_MUTANT_HELPER_METHOD = '__coverMutant__';
// export const ACTIVE_MUTANT = 'activeMutant';

// /**
//  * Returns syntax for the global header
//  */
// export function declareGlobal(): types.VariableDeclaration {
//   return parse(`var ${GLOBAL} = (function(g){
//     g.${MUTATION_COVERAGE_OBJECT} = g.${MUTATION_COVERAGE_OBJECT} || { static: {} };
//     g.${COVER_MUTANT_HELPER_METHOD} = g.${COVER_MUTANT_HELPER_METHOD} || function () {
//       var c = g.${MUTATION_COVERAGE_OBJECT}.static;
//       if (g.__currentTestId__) {
//         c = g.${MUTATION_COVERAGE_OBJECT}[g.__currentTestId__];
//       }
//       var a = arguments;
//       for(var i=0; i < a.length; i++){
//         c[a[i]] = (c[a[i]] || 0) + 1;
//       }
//     };
//     return g;
//   })(new Function("return this")())`).program.body[0] as types.VariableDeclaration;
// }

// /**
//  * returns syntax for `global.activeMutant === $mutantId`
//  * @param mutantId The id of the mutant to switch
//  */
// export function mutantTestExpression(mutantId: number): types.BinaryExpression {
//   return types.binaryExpression('===', memberExpressionChain(GLOBAL, ACTIVE_MUTANT), types.numericLiteral(mutantId));
// }

// /**
//  * Creates a member expression chain: `memberExpressionChain('a', 'b', 'c', 4)` =>  `a.b.c[4]`
//  */
// export function memberExpressionChain(...identifiers: Array<string | number>): types.Identifier | types.MemberExpression {
//   const currentIdentifier = identifiers[identifiers.length - 1];
//   if (identifiers.length === 1) {
//     return types.identifier(currentIdentifier.toString());
//   } else {
//     return types.memberExpression(
//       memberExpressionChain(...identifiers.slice(0, identifiers.length - 1)),
//       types.identifier(currentIdentifier.toString()),
//       /* computed */ typeof currentIdentifier === 'number'
//     );
//   }
// }

// /**
//  * Returns a sequence of mutation coverage counters with an optional last expression.
//  *
//  * @example (global.__coverMutant__(0), global.__coverMutant__(1), 40 + 2)
//  * @param mutants The mutant ids for which covering syntax needs to be generated
//  * @param targetExpression The original expression
//  */
// export function mutationCoverageSequenceExpression(mutants: Mutant[], targetExpression?: types.Expression): types.Expression {
//   const sequence: types.Expression[] = [
//     types.callExpression(
//       memberExpressionChain(GLOBAL, COVER_MUTANT_HELPER_METHOD),
//       mutants.map((mutant) => types.numericLiteral(mutant.id))
//     ),
//   ];
//   if (targetExpression) {
//     sequence.push(targetExpression);
//   }
//   return types.sequenceExpression(sequence);
// }

// interface Position {
//   line: number;
//   column: number;
// }

// function eqLocation(a: types.SourceLocation, b: types.SourceLocation): boolean {
//   function eqPosition(a: Position, b: Position): boolean {
//     return a.column === b.column && a.line === b.line;
//   }
//   return eqPosition(a.start, b.start) && eqPosition(a.end, b.end);
// }

// export function eqNode<T extends types.Node>(a: T, b: types.Node): b is T {
//   return a.type === b.type && !!a.loc && !!b.loc && eqLocation(a.loc, b.loc);
// }

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

// export function createMutatedAst<T extends types.Node>(contextPath: NodePath<T>, mutant: Mutant): T {
//   if (eqNode(contextPath.node, mutant.original)) {
//     return mutant.replacement as T;
//   } else {
//     const mutatedAst = types.cloneNode(contextPath.node, /*deep*/ true);
//     let isAstMutated = false;

//     traverse(
//       mutatedAst,
//       {
//         noScope: true,
//         enter(path) {
//           if (eqNode(path.node, mutant.original)) {
//             path.replaceWith(mutant.replacement);
//             path.stop();
//             isAstMutated = true;
//           }
//         },
//       },
//       contextPath.scope
//     );
//     if (!isAstMutated) {
//       throw new Error(`Could not apply mutant ${JSON.stringify(mutant.replacement)}.`);
//     }
//     return mutatedAst;
//   }
// }

// export function isTypeAnnotation(path: NodePath): boolean {
//   return (
//     path.isInterfaceDeclaration() ||
//     path.isTypeAnnotation() ||
//     types.isTSInterfaceDeclaration(path.node) ||
//     types.isTSTypeAnnotation(path.node) ||
//     types.isTSTypeAliasDeclaration(path.node) ||
//     types.isTSModuleDeclaration(path.node) ||
//     types.isTSEnumDeclaration(path.node)
//   );
// }

// export function isImportDeclaration(path: NodePath): boolean {
//   return types.isTSImportEqualsDeclaration(path.node) || path.isImportDeclaration();
// }
