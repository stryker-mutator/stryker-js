// A test can mock away the 'real' Date class. Capture it while we still can.
const RealDate = Date;
export class Timer {
  private start: Date;

  constructor() {
    this.reset();
  }

  public reset() {
    this.start = new RealDate();
  }

  public elapsedMs() {
    return new RealDate().getTime() - this.start.getTime();
  }
}
