export class DependencyNode {
  public imports: DependencyNode[] = [];
  public dependencies: DependencyNode[] = [];

  constructor(public readonly fileName: string) { }

  public getAllDependencies(nodesSeen: DependencyNode[] = []): DependencyNode[] {
    if (nodesSeen.includes(this)) return [];
    nodesSeen.push(this);

    let dependencies: DependencyNode[] = [...this.dependencies];

    this.dependencies
      .filter((d) => !nodesSeen.includes(d))
      .forEach((d) => {
        dependencies = [...dependencies, ...d.getAllDependencies(nodesSeen)];
      });

    return dependencies;
  }
}
