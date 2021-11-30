import { DependencyFile } from '../compiler';

import { DependencyNode } from './dependency-node';

export class DependencyGraph {
  public readonly nodes: Record<string, DependencyNode> = {};

  constructor(dependencyFiles: DependencyFile[]) {
    dependencyFiles = dependencyFiles.filter((f) => !f.fileName.includes('node_modules')).filter((f) => !f.fileName.includes('spec.ts'));

    dependencyFiles.forEach((df) => {
      this.nodes[df.fileName] = new DependencyNode(df.fileName);
    });

    dependencyFiles.forEach((df) => {
      this.nodes[df.fileName].imports = df.imports.filter((importName) => this.nodes[importName]).map((importName) => this.nodes[importName]);
    });

    // set dependencies
    for (const key in this.nodes) {
      const node = this.nodes[key];
      node.imports.forEach((importFile) => {
        this.nodes[importFile.fileName].dependencies.push(node);
      });
    }
  }
}
