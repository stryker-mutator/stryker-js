export class Timer {
  private readonly start: Date;
  private readonly markers: Record<string, Date | undefined> =
    Object.create(null);

  constructor(private readonly now = () => new Date()) {
    this.start = this.now();
  }
  public humanReadableElapsed(sinceMarker?: string): string {
    const elapsedSeconds = this.elapsedSeconds(sinceMarker);
    return (
      Timer.humanReadableElapsedMinutes(elapsedSeconds) +
      Timer.humanReadableElapsedSeconds(elapsedSeconds)
    );
  }

  public elapsedSeconds(sinceMarker?: string): number {
    const elapsedMs = this.elapsedMs(sinceMarker);
    return Math.floor(elapsedMs / 1000);
  }

  public elapsedMs(sinceMarker?: string): number {
    const marker = sinceMarker && this.markers[sinceMarker];
    if (marker) {
      return this.now().getTime() - marker.getTime();
    } else {
      return this.now().getTime() - this.start.getTime();
    }
  }

  public mark(name: string): void {
    this.markers[name] = this.now();
  }

  private static humanReadableElapsedSeconds(elapsedSeconds: number) {
    const restSeconds = elapsedSeconds % 60;
    return this.formatTime('second', restSeconds);
  }

  private static humanReadableElapsedMinutes(elapsedSeconds: number) {
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes === 0) {
      return '';
    } else {
      return this.formatTime('minute', elapsedMinutes);
    }
  }

  private static formatTime(word: 'minute' | 'second', elapsed: number) {
    const s = elapsed === 1 ? '' : 's';
    const blank = word === 'minute' ? ' ' : '';
    return `${elapsed} ${word}${s}${blank}`;
  }
}
