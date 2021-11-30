export class DependencyNode {
  public imports: DependencyNode[] = [];
  public dependencies: DependencyNode[] = [];

  constructor(public readonly fileName: string) {}

}
