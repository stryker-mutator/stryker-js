import type { NodePath, types } from '@babel/core';

export class SvelteTemplateExpressionContext {
  private readonly templateExpressionPrograms = new WeakSet<types.Program>();

  public markAsTemplateExpression(file: types.File): void {
    this.templateExpressionPrograms.add(file.program);
  }

  public isTemplateExpressionContext(path: NodePath): boolean {
    const program = this.findProgram(path);
    return (
      program !== undefined && this.templateExpressionPrograms.has(program)
    );
  }

  public isTemplateExpressionRoot(path: NodePath): boolean {
    return (
      this.isTemplateExpressionContext(path) &&
      path.parentPath?.isExpressionStatement() === true &&
      path.parentPath.parentPath?.isProgram() === true
    );
  }

  private findProgram(path: NodePath): types.Program | undefined {
    if (path.isProgram()) {
      return path.node;
    }
    const programPath = path.findParent((parent) => parent.isProgram());
    if (programPath?.isProgram()) {
      return programPath.node;
    }
    return undefined;
  }
}
