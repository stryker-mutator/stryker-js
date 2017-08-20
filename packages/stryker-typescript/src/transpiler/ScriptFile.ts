

export default class ScriptFile {
  private originalContent: string;
  constructor(public name: string, public content: string, public version = 0) {
    this.originalContent = content;
  }

  replace(tempContent: string) {
    this.content = tempContent;
    this.version++;
  }
  restore() {
    this.content = this.originalContent;
    this.version++;
  }
}