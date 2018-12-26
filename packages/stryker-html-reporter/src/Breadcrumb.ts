export default class Breadcrumb {

  public get depth(): number {
    if (this.previousItem) {
      return this.previousItem.depth + this.addedDepth;
    } else {
      return this.addedDepth;
    }
  }

  public static start = new Breadcrumb('All files', 0);

  private constructor(public title: string, public addedDepth: number, public previousItem?: Breadcrumb) {
  }

  public add(title: string, addedDepth: number) {
    return new Breadcrumb(title, addedDepth, this);
  }
}
