import * as babel from '@babel/core';
import { parse, ParserPlugin } from '@babel/parser';
import generator from '@babel/generator';
import { expect } from 'chai';

import { NodeMutator } from '../../src/mutators/node-mutator.js';
import type { NodeMutatorContext } from '../../src/mutators/node-mutator.js';

const plugins = [
  'doExpressions',
  'exportDefaultFrom',
  'functionBind',
  'functionSent',
  'importMeta',
  ['pipelineOperator', { proposal: 'fsharp' }],
  'throwExpressions',
  'v8intrinsic',
  'partialApplication',
  'decorators',
  'jsx',
  'typescript',
] as ParserPlugin[];

export function expectJSMutation(
  sut: NodeMutator,
  originalCode: string,
  nodeMutatorContext: NodeMutatorContext,
  ...expectedReplacements: string[]
): void {
  const sourceFileName = 'source.js';
  const ast = parse(originalCode, {
    sourceFilename: sourceFileName,
    plugins,
    sourceType: 'module',
  });
  const mutants: string[] = [];
  const originalNodeSet = nodeSet(ast);

  babel.traverse(ast, {
    enter(path: babel.NodePath) {
      for (const replacement of sut.mutate(path, nodeMutatorContext)) {
        const mutatedCode = generator(replacement).code;
        const beforeMutatedCode = originalCode.substring(
          0,
          path.node.start ?? 0,
        );
        const afterMutatedCode = originalCode.substring(path.node.end ?? 0);
        const mutant = `${beforeMutatedCode}${mutatedCode}${afterMutatedCode}`;
        mutants.push(mutant);

        for (const replacementNode of nodeSet(replacement, path)) {
          if (originalNodeSet.has(replacementNode)) {
            expect.fail(
              `Mutated ${replacementNode.type} node \`${
                generator(replacementNode).code
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

function nodeSet(ast: babel.types.Node, parentPath?: babel.NodePath) {
  const set = new Set<babel.types.Node>();
  babel.traverse(
    ast,
    {
      enter(path: babel.NodePath) {
        set.add(path.node);
      },
    },
    parentPath?.scope,
    parentPath?.state,
    parentPath,
  );
  return set;
}
