export class IdGenerator {
  private childId;
  constructor() {
    this.childId = 0;
  }
  public next(): number {
    return this.childId++;
  }
}
