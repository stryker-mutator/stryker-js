import { traverse } from '@babel/core';
import { parse, ParserPlugin } from '@babel/parser';
import generate from '@babel/generator';
import { expect } from 'chai';

import { NodeMutator } from '../../src/mutators/node-mutator';

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
  const mutants: string[] = [];
  traverse(ast, {
    enter(path) {
      for (const replacement of sut.mutate(path)) {
        const mutatedCode = generate(replacement).code;
        const beforeMutatedCode = originalCode.substring(0, path.node.start ?? 0);
        const afterMutatedCode = originalCode.substring(path.node.end ?? 0);

        mutants.push(`${beforeMutatedCode}${mutatedCode}${afterMutatedCode}`);
      }
    },
  });
  expect(mutants).lengthOf(expectedReplacements.length);
  expectedReplacements.forEach((expected) => expect(mutants, `was: ${mutants.join(',')}`).to.include(expected));
}
