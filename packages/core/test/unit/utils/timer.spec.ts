import { expect } from 'chai';
import * as sinon from 'sinon';

import { Timer } from '../../../src/utils/timer';

describe(Timer.name, () => {
  let clock: sinon.SinonFakeTimers;
  let sut: Timer;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    sut = new Timer();
  });

  afterEach(() => clock.restore());

  describe(Timer.prototype.humanReadableElapsed.name, () => {
    const arrangeActAssert = (elapsedMs: number, expectedTimeLabel: string) => {
      it(`should show "${expectedTimeLabel}" after ${elapsedMs} ms`, () => {
        clock.tick(elapsedMs);
        expect(sut.humanReadableElapsed()).to.be.eq(expectedTimeLabel);
      });
    };

    arrangeActAssert(59999, '59 seconds');
    arrangeActAssert(119999, '1 minute 59 seconds');
    arrangeActAssert(120000, '2 minutes 0 seconds');
    arrangeActAssert(121999, '2 minutes 1 second');
    arrangeActAssert(61000, '1 minute 1 second');

    it('should use the since marker when provided', () => {
      clock.tick(1000);
      sut.mark('foo');
      clock.tick(1000);
      expect(sut.humanReadableElapsed('foo')).eq('1 second');
    });
  });

  describe('mark and elapsedMS', () => {
    it('should result in expected elapsedMS', () => {
      clock.tick(10);
      sut.mark('foo');
      clock.tick(10);
      sut.mark('bar');
      clock.tick(10);
      expect(sut.elapsedMs('foo')).eq(20);
      expect(sut.elapsedMs('bar')).eq(10);
    });

    it('should give total elapsed if elapsed is requested without a valid mark', () => {
      clock.tick(10);
      sut.mark('foo');
      clock.tick(10);
      expect(sut.elapsedMs('bar')).eq(20);
    });
  });
});
