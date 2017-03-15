import * as sinon from 'sinon';
import { expect } from 'chai';
import Timer from '../../../src/utils/Timer';

describe('Timer', () => {
  let clock: sinon.SinonFakeTimers;
  let sut: Timer;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    sut = new Timer();
  });

  const arrangeActAssert = (elapsedMs: number, expectedTimeLabel: string) => {
    describe(`after ${expectedTimeLabel}`, () => {
      beforeEach(() => clock.tick(elapsedMs));

      it(`should show "${expectedTimeLabel}" when humanReadableElapsed()`,
        () => expect(sut.humanReadableElapsed()).to.be.eq(expectedTimeLabel));
    });
  };

  arrangeActAssert(59999, '59 seconds');
  arrangeActAssert(119999, '1 minute 59 seconds');
  arrangeActAssert(120000, '2 minutes 0 seconds');
  arrangeActAssert(121999, '2 minutes 1 second');
  arrangeActAssert(61000, '1 minute 1 second');

  afterEach(() => clock.restore());
});