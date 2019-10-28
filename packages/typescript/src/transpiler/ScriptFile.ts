export default class ScriptFile {
  constructor(public name: string, public content: string, public version = 0) {}

  public replace(newContent: string) {
    this.content = newContent;
    this.version++;
  }
}
