// A test can mock away the 'real' Date class. Capture it while we still can.
const realDate = Date;
export default class Timer {
  private start: Date;

  constructor() {
    this.reset();
  }

  public reset() {
    this.start = new realDate();
  }

  public elapsedMs() {
    return new realDate().getTime() - this.start.getTime();
  }
}
