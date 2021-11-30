import path from 'path';

import { Mutant } from '@stryker-mutator/api/core';

// @ts-expect-error
import precinct from 'precinct';

import ts from 'typescript';

import { toPosixFileName } from './fs/tsconfig-helpers';

import { MemoryFileSystem } from './fs/memory-filesystem';
import { DependencyGraph } from './graph/dependency-graph';
import { DependencyNode } from './graph/dependency-node';

// node mag niet in negeerlijst staan
// dependencies van node mogen niet in de groep staan

export function createGroups(graph: DependencyGraph, mutants: Mutant[]): Mutant[][] {
  let leftOverMutants = [...mutants];
  let groups: Mutant[][] = [];

  while (leftOverMutants.length) {
    const firstMutant = leftOverMutants[0];
    const firstNode = graph.nodes[toPosixFileName(firstMutant.fileName)];
    const group: Array<{ node: DependencyNode; mutant: Mutant }> = [{ node: firstNode, mutant: firstMutant }];
    const ignoreList = [firstNode, ...firstNode.getAllDependencies()];

    // start with 1 because we already took the first mutant
    for (let index = 1; index < leftOverMutants.length; index++) {
      const activeMutant = leftOverMutants[index];
      const activeNode = graph.nodes[toPosixFileName(activeMutant.fileName)];

      if (
        !ignoreList.includes(activeNode) && // node mag niet in negeerlijst staan
        !group.some((g) => activeNode.getAllDependencies().includes(g.node)) // dependencies van node mogen niet in de groep staan
      ) {
        group.push({ node: activeNode, mutant: activeMutant });
      }
    }

    leftOverMutants = leftOverMutants.filter((m) => group.findIndex((g) => g.mutant.id === m.id) === -1);
    groups = [...groups, group.map((g) => g.mutant)];
  }

  return groups;
}

export function matchErrorsWithMutant(graph: DependencyGraph, mutants: Mutant[], error: ts.Diagnostic): Mutant[] {
  return [];
}

export class GroupBuilder {
  private readonly tree: Record<string, { dependencies: string[]; imports: string[]; mutants: Mutant[] }> = {};
  private readonly filesSeen: string[] = [];

  constructor(private readonly fs: MemoryFileSystem) { }

  public matchErrorWithGroup(mutantsGroup: Mutant[], errorFileName: string, nodeSeen: string[] = []): Mutant[] {
    this.createTreeFromMutants(mutantsGroup);
    this.getDependenciesRecursive(errorFileName);

    this.getDependenciesRecursive(errorFileName);
    let mutantsHit: Mutant[] = [];

    this.tree[errorFileName].imports.forEach((node) => {
      if (nodeSeen.includes(node)) return;
      nodeSeen.push(node);
      const index = mutantsGroup.findIndex((m) => toPosixFileName(m.fileName) === toPosixFileName(node));
      if (index >= 0) mutantsHit.push(mutantsGroup[index]);
      mutantsHit = [...mutantsHit, ...this.matchErrorWithGroup(mutantsGroup, node, nodeSeen)];
    });

    return mutantsHit;
  }

  public createTreeFromMutants(mutants: Mutant[]): void {
    mutants.forEach((mutant) => {
      const fileName = toPosixFileName(mutant.fileName);
      this.getDependenciesRecursive(fileName);
      this.tree[fileName].mutants.push(mutant);
    });
  }

  private getDependenciesRecursive(fileName: string) {
    if (this.filesSeen.includes(fileName)) return;

    const imports = this.getDependencies(fileName);
    if (!this.tree[fileName]) this.tree[fileName] = { imports: imports, mutants: [], dependencies: [] };
    this.filesSeen.push(fileName);

    try {
      imports.forEach((d) => {
        this.addDependency(d, fileName);
        this.getDependenciesRecursive(d);
      });
    } catch (e) {
      console.log(fileName);
    }
  }

  // todo fix that every type can be used
  private getDependencies(fileName: string): string[] {
    const content = this.fs.getFile(fileName)?.content;
    if (!content) return [];
    const dependencies: string[] = precinct(content, { type: 'ts' });
    return dependencies
      .filter((dependency: string) => dependency.startsWith('.'))
      .map((d) => toPosixFileName(path.resolve(path.dirname(fileName), d + '.ts')));
  }

  private addDependency(dependency: string, dependsOn: string) {
    if (this.tree[dependency]) {
      if (this.tree[dependency].dependencies.includes(dependsOn)) return;
      this.tree[dependency].dependencies.push(dependsOn);
    } else {
      const imports = this.getDependencies(dependency);

      this.tree[dependency] = {
        dependencies: [dependsOn],
        imports: imports,
        mutants: [],
      };
    }
  }

  public getGroups(mutants: Mutant[]): Mutant[][] {
    this.createTreeFromMutants(mutants);
    const mutantsNotIncludedInTree: Mutant[][] = [];

    mutants.forEach((m) => {
      const include = Object.keys(this.tree).findIndex((e) => toPosixFileName(e) === toPosixFileName(m.fileName));
      if (include === -1) mutantsNotIncludedInTree.push([m]);
    });

    return [...this.generateGroups(), ...mutantsNotIncludedInTree];
  }

  private generateGroups(): Mutant[][] {
    const mutantGroups: Mutant[][] = [];
    const usedNodes: string[] = [];
    for (const activeNode in this.tree) {
      if (!this.shouldUseNode(activeNode, usedNodes)) continue;
      usedNodes.push(activeNode);

      const currentMutantGroup = this.tree[activeNode].mutants.splice(0, 1);
      const currentNodeGroup = [activeNode];
      let ignoreNodes = this.getAllDependencies(activeNode);

      for (const searchNode in this.tree) {
        if (searchNode === activeNode || !this.shouldUseNode(searchNode, usedNodes)) continue;

        if (this.allowedInGroup(ignoreNodes, currentNodeGroup, searchNode)) {
          usedNodes.push(searchNode);
          currentMutantGroup.push(this.tree[searchNode].mutants.splice(0, 1)[0]);
          currentNodeGroup.push(searchNode);

          ignoreNodes = [...ignoreNodes, ...this.getAllDependencies(searchNode)];
        }
      }

      mutantGroups.push(currentMutantGroup);
    }

    if (mutantGroups.length) {
      return [...mutantGroups, ...this.generateGroups()];
    }

    return mutantGroups;
  }

  private shouldUseNode(node: string, usedNodes: string[]): boolean {
    if (usedNodes.includes(node)) false;
    return this.tree[node].mutants.length > 0;
  }

  private allowedInGroup(ignoreNodes: string[], currentNodeGroup: string[], searchNode: string): boolean {
    if (ignoreNodes.includes(searchNode)) return false;

    for (const groupNode of this.getAllDependencies(searchNode)) {
      if (currentNodeGroup.includes(groupNode)) return false;
    }

    return true;
  }

  private getAllDependencies(node: string, seenNodes: string[] = []): string[] {
    let nodes = [...this.tree[node].dependencies];

    this.tree[node].dependencies.forEach((n) => {
      if (seenNodes.includes(n)) return;
      seenNodes.push(n);
      nodes = [...nodes, ...this.getAllDependencies(n, seenNodes)];
    });

    return nodes;
  }
}
