import { expect } from 'chai';
import * as sinon from 'sinon';

import Timer from '../../src/timer';

describe('Timer', () => {
  let sut: Timer;

  beforeEach(() => (sut = new Timer()));

  describe('when global Date object is mocked', () => {
    let clock: sinon.SinonFakeTimers;
    beforeEach(() => (clock = sinon.useFakeTimers()));

    afterEach(() => clock.restore());

    it('should work even when global Date object is mocked', () => expect(sut.elapsedMs()).to.be.greaterThan(-1));
  });
});
