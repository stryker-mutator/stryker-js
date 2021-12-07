import { expect } from 'chai';

import { DependencyNode } from '../../../src/graph/dependency-node';

describe('group', () => {
  it('retrieve-all-dependencies', () => {
    const node = new DependencyNode('a.ts');
    const node2 = new DependencyNode('b.ts');
    const node3 = new DependencyNode('c.ts');
    node.dependencies = [node2];
    node2.dependencies = [node3];
    node3.dependencies = [node];

    expect(node.getAllDependencies()).to.have.lengthOf(3);
  });

  it('retrieve-all-imports', () => {
    const node = new DependencyNode('a.ts');
    const node2 = new DependencyNode('b.ts');
    const node3 = new DependencyNode('c.ts');
    node.imports = [node2];
    node2.imports = [node3];
    node3.imports = [node];

    expect(node.getAllImports()).to.have.lengthOf(3);
  });
});
