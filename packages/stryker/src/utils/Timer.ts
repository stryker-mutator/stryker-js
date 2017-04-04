
export default class Timer {
  private start: Date;

  constructor() {
    this.reset();
  }

  reset() {
    this.start = new Date();
  }

  humanReadableElapsed() {
    const elapsedSeconds = this.elapsedSeconds();
    return Timer.humanReadableElapsedMinutes(elapsedSeconds) + Timer.humanReadableElapsedSeconds(elapsedSeconds);
  }

  elapsedSeconds() {
    const elapsedMs = new Date().getTime() - this.start.getTime();
    return Math.floor(elapsedMs / 1000);
  }

  private static humanReadableElapsedSeconds(elapsedSeconds: number) {
    const restSeconds = elapsedSeconds % 60;
    if (restSeconds === 1) {
      return `${restSeconds} second`;
    } else {
      return `${restSeconds} seconds`;
    }
  }

  private static humanReadableElapsedMinutes(elapsedSeconds: number) {
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes > 1) {
      return `${elapsedMinutes} minutes `;
    } else if (elapsedMinutes > 0) {
      return `${elapsedMinutes} minute `;
    } else {
      return '';
    }
  }
}