import babel from '@babel/core';
import { parse, ParserPlugin } from '@babel/parser';
import generator from '@babel/generator';
import { expect } from 'chai';

import { NodeMutator } from '../../src/mutators/node-mutator.js';

const generate = generator.default;

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
  const originalNodeSet = nodeSet(ast);

  babel.traverse(ast, {
    enter(path) {
      for (const replacement of sut.mutate(path)) {
        const mutatedCode = generate(replacement).code;
        const beforeMutatedCode = originalCode.substring(0, path.node.start ?? 0);
        const afterMutatedCode = originalCode.substring(path.node.end ?? 0);
        const mutant = `${beforeMutatedCode}${mutatedCode}${afterMutatedCode}`;
        mutants.push(mutant);

        for (const replacementNode of nodeSet(replacement, path)) {
          if (originalNodeSet.has(replacementNode)) {
            expect.fail(
              `Mutated ${replacementNode.type} node \`${
                generate(replacementNode).code
              }\` was found in the original AST. Please be sure to deep clone it (using \`cloneNode(ast, true)\`)`,
            );
          }
        }
      }
    },
  });

  /* because we know mutants and expectedReplacements are strings */
  mutants.sort();
  expectedReplacements.sort();

  expect(mutants).to.deep.equal(expectedReplacements);
}

function nodeSet(ast: babel.Node, parentPath?: babel.NodePath) {
  const set = new Set<babel.Node>();
  babel.traverse(
    ast,
    {
      enter(path) {
        set.add(path.node);
      },
    },
    parentPath?.scope,
    parentPath?.state,
    parentPath,
  );
  return set;
}
