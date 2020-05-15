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
] as ParserPlugin[];

export function expectJSMutation(sut: NodeMutator, originalCode: string, ...expectedReplacements: string[]) {
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
  expect(mutants).lengthOf(expectedReplacements.length);
  const actualReplacements = mutants.map(jsMutantToString);
  expectedReplacements.forEach((expected) => expect(actualReplacements, `was: ${actualReplacements.join(',')}`).to.include(expected));
}

function jsMutantToString(mutant: NodeMutation): string {
  return generate(mutant.replacement).code;
}
