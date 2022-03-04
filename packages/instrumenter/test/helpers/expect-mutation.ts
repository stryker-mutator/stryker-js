import babel from '@babel/core';
import { parse, ParserPlugin } from '@babel/parser';
import generator from '@babel/generator';
import { expect } from 'chai';

import { NodeMutator } from '../../src/mutators/node-mutator.js';

// @ts-expect-error CJS typings not in line with synthetic esm
const generate: typeof generator = generator.default;

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
  babel.traverse(ast, {
    enter(path) {
      for (const replacement of sut.mutate(path)) {
        const mutatedCode = generate(replacement).code;
        const beforeMutatedCode = originalCode.substring(0, path.node.start ?? 0);
        const afterMutatedCode = originalCode.substring(path.node.end ?? 0);

        mutants.push(`${beforeMutatedCode}${mutatedCode}${afterMutatedCode}`);
      }
    },
  });
  /* eslint-disable @typescript-eslint/require-array-sort-compare */
  /* because we know mutants and expectedReplacements are strings */
  mutants.sort();
  expectedReplacements.sort();
  /* eslint-enable @typescript-eslint/require-array-sort-compare */
  expect(mutants).to.deep.equal(expectedReplacements);
}
