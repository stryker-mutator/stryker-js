// A test can mock away the 'real' Date class. Capture it while we still can.
const RealDate = Date;
export class Timer {
  private start!: Date;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.start = new RealDate();
  }

  public elapsedMs(): number {
    return new RealDate().getTime() - this.start.getTime();
  }
}
