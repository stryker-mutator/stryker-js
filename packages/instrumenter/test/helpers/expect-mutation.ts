import { traverse } from '@babel/core';
import { parse, ParserPlugin } from '@babel/parser';
import generate from '@babel/generator';
import { expect } from 'chai';

import { NodeMutator } from '../../src/mutators/node-mutator';
import { NodeMutation } from '../../src/mutant';

const plugins = [
  'doExpressions',
  'objectRestSpread',
  'classProperties',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'asyncGenerators',
  'functionBind',
  'functionSent',
  'dynamicImport',
  'numericSeparator',
  'importMeta',
  'optionalCatchBinding',
  'optionalChaining',
  'classPrivateProperties',
  ['pipelineOperator', { proposal: 'minimal' }],
  'nullishCoalescingOperator',
  'bigInt',
  'throwExpressions',
  'logicalAssignment',
  'classPrivateMethods',
  'v8intrinsic',
  'partialApplication',
  ['decorators', { decoratorsBeforeExport: false }],
  'jsx',
  'typescript',
] as ParserPlugin[];

export function expectJSMutation(sut: NodeMutator, originalCode: string, ...expectedReplacements: string[]): void {
  const sourceFileName = 'source.js';
  const ast = parse(originalCode, {
    sourceFilename: sourceFileName,
    plugins,
    sourceType: 'module',
  });
  const mutants: NodeMutation[] = [];
  traverse(ast, {
    enter(nodePath) {
      mutants.push(...sut.mutate(nodePath));
    },
  });
  const actualReplacements = mutants.map((mutant) => jsMutantToString(mutant, originalCode));
  expect(mutants, `was: ${actualReplacements.join(',')}`).lengthOf(expectedReplacements.length);
  expectedReplacements.forEach((expected) => expect(actualReplacements, `was: ${actualReplacements.join(',')}`).to.include(expected));
}

function jsMutantToString(mutant: NodeMutation, originalCode: string): string {
  const mutatedCode = generate(mutant.replacement).code;
  const beforeMutatedCode = originalCode.substring(0, mutant.original.start ?? 0);
  const afterMutatedCode = originalCode.substring(mutant.original.end ?? 0);

  return `${beforeMutatedCode}${mutatedCode}${afterMutatedCode}`;
}
