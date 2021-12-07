import { existsSync, mkdirSync, unlinkSync } from 'fs';

import { EOL } from 'os';

import { Mutant } from '@stryker-mutator/api/core';

import graphviz from 'graphviz';

import { toPosixFileName } from './fs/tsconfig-helpers';

import { DependencyGraph } from './graph/dependency-graph';
import { DependencyNode } from './graph/dependency-node';
import ts from 'typescript';

export function createGroups(graph: DependencyGraph, mutants: Mutant[]): Mutant[][] {
  let leftOverMutants = [...mutants];
  let groups: Mutant[][] = [];

  while (leftOverMutants.length) {
    const firstMutant = leftOverMutants[0];
    const firstNode = graph.nodes[toPosixFileName(firstMutant.fileName)];
    const group: Array<{ node: DependencyNode; mutant: Mutant }> = [{ node: firstNode, mutant: firstMutant }];
    let ignoreList = [firstNode, ...firstNode.getAllDependencies()];

    // start with 1 because we already took the first mutant
    for (let index = 1; index < leftOverMutants.length; index++) {
      const activeMutant = leftOverMutants[index];
      const activeNode = graph.nodes[toPosixFileName(activeMutant.fileName)];

      if (!ignoreList.includes(activeNode) && !dependencyInGroup(activeNode?.getAllDependencies(), group)) {
        group.push({ node: activeNode, mutant: activeMutant });
        ignoreList = [...ignoreList, activeNode, ...activeNode.getAllDependencies()];
      }
    }

    leftOverMutants = leftOverMutants.filter((m) => group.findIndex((g) => g.mutant.id === m.id) === -1);
    groups = [...groups, group.map((g) => g.mutant)];
  }

  return groups;
}

function dependencyInGroup(dependencies: DependencyNode[], group: Array<{ node: DependencyNode; mutant: Mutant }>): boolean {
  for (const dependency of dependencies) {
    for (const node of group) {
      if (node.node === dependency) {
        return true;
      }
    }
  }

  return false;
}

export function createImage(imageName: string, graph: DependencyGraph, mutants: Mutant[], errors: ts.Diagnostic[]): void {
  const treeGraphviz = graphviz.digraph('G');

  for (const nodeName in graph.nodes) {
    const node = graph.nodes[nodeName];
    const graphvizNode = treeGraphviz.addNode(node.fileName, {
      color: 'whitesmoke',
      style: 'filled,bold',
      shape: 'rect',
      fontname: 'Arial',
      nodesep: '5',
      fillcolor: 'whitesmoke',
    });

    const errorsWithNode = errors.filter((e) => node.fileName === e.file?.fileName);
    if (errorsWithNode.length) {
      graphvizNode.set('color', 'orange');
      graphvizNode.set('fillcolor', 'orange');
      graphvizNode.set('tooltip', ts.formatDiagnostics(errorsWithNode, diagnosticsHost));
    }

    const mutant = mutants.find((m) => toPosixFileName(m.fileName) === node.fileName);
    if (mutant) {
      graphvizNode.set('fillcolor', 'cyan');
      graphvizNode.set('label', `${toPosixFileName(mutant.fileName)} (${mutant.id})`);
    }
  }

  for (const nodeName in graph.nodes) {
    const node = graph.nodes[nodeName];
    node.dependencies.forEach((dependency) => {
      treeGraphviz.addEdge(dependency.fileName, node.fileName, { color: 'black' });
    });
  }

  if (!existsSync(`${process.cwd()}/graphs/`)) mkdirSync(`${process.cwd()}/graphs/`);
  const imagePath = `${process.cwd()}/graphs/${imageName}.svg`;

  try {
    if (existsSync(imagePath)) unlinkSync(imagePath);
    treeGraphviz.output('svg', imagePath);
  } catch (e) {
    console.log(e);
  }
}

const diagnosticsHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: process.cwd,
  getNewLine: () => EOL,
};
