export class Timer {
  private readonly now: () => Date;
  private start: Date;
  private markers: {
    [name: string]: Date;
  };

  constructor(now = () => new Date()) {
    this.now = now;
    this.reset();
  }

  public reset() {
    this.markers = Object.create(null);
    this.start = this.now();
  }

  public humanReadableElapsed() {
    const elapsedSeconds = this.elapsedSeconds();
    return Timer.humanReadableElapsedMinutes(elapsedSeconds) + Timer.humanReadableElapsedSeconds(elapsedSeconds);
  }

  public elapsedSeconds() {
    const elapsedMs = this.elapsedMs();
    return Math.floor(elapsedMs / 1000);
  }

  public elapsedMs(sinceMarker?: string) {
    if (sinceMarker && this.markers[sinceMarker]) {
      return this.now().getTime() - this.markers[sinceMarker].getTime();
    } else {
      return this.now().getTime() - this.start.getTime();
    }
  }

  public mark(name: string) {
    this.markers[name] = this.now();
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
