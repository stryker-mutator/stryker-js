
// A test can mock away the 'real' Date class. Capture it while we still can.
const RealDate = Date;
export default class Timer {
  private start: Date;

  constructor() {
    this.reset();
  }

  reset() {
    this.start = new RealDate();
  }

  elapsedMs() {
    return new RealDate().getTime() - this.start.getTime();
  }
}