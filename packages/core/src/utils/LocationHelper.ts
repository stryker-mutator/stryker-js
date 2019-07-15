import { Location } from '@stryker-mutator/api/core';

export default class LocationHelper {

  public static maxValue = new LocationHelper(Object.freeze({
    end: Object.freeze({ column: Number.POSITIVE_INFINITY, line: Number.POSITIVE_INFINITY }),
    start: Object.freeze({ column: 0, line: -1 })
  }));

  constructor(private readonly loc: Location) { }

  /**
   * Indicates whether the current location is covered by an other location.
   * @param maybeWrapper The location that is questioned to be wrapping this location.
   * @returns true if this location is covered by given location, otherwise false
   */
  public isCoveredBy(maybeWrapper: Location): boolean {
    const isAfterStart = this.loc.start.line > maybeWrapper.start.line ||
      (this.loc.start.line === maybeWrapper.start.line && this.loc.start.column >= maybeWrapper.start.column);
    const isBeforeEnd = this.loc.end.line < maybeWrapper.end.line ||
      (this.loc.end.line === maybeWrapper.end.line && this.loc.end.column <= maybeWrapper.end.column);
    return isAfterStart && isBeforeEnd;
  }

  /**
   * Indicates whether the given location is smaller than this location.
   * @param maybeSmaller The area which is questioned to cover a smaller area than this location.
   * @returns true if the given location covers a smaller area than this one.
   */
  public isSmallerArea(maybeSmaller: Location) {
    let firstLocationHasSmallerArea = false;
    const lineDifference = (this.loc.end.line - this.loc.start.line) - (maybeSmaller.end.line - maybeSmaller.start.line);
    const coversLessLines = lineDifference > 0;
    const coversLessColumns = lineDifference === 0 && (maybeSmaller.start.column - this.loc.start.column) + (this.loc.end.column - maybeSmaller.end.column) > 0;
    if (coversLessLines || coversLessColumns) {
      firstLocationHasSmallerArea = true;
    }
    return firstLocationHasSmallerArea;
  }
}
