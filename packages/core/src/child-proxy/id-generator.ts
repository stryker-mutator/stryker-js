export class IdGenerator {
  private id = 0;
  public next(): number {
    return this.id++;
  }
}
