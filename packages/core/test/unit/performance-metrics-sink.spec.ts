import { expect } from 'chai';

import { PerformanceMetricsSink } from '../../src/performance-metrics-sink.js';

describe(PerformanceMetricsSink.name, () => {
  describe('when enabled', () => {
    let sink: PerformanceMetricsSink;

    beforeEach(() => {
      sink = new PerformanceMetricsSink(true);
    });

    it('should record reloads per mutant and accumulate their time', () => {
      sink.recordReload('1', 100);
      sink.recordReload('1', 50);
      sink.recordReload('2', 0);

      expect(sink.didReload('1')).true;
      expect(sink.reloadMsFor('1')).equal(150);
      expect(sink.didReload('2')).true;
      expect(sink.reloadMsFor('2')).equal(0);
      expect(sink.didReload('3')).false;
      expect(sink.reloadMsFor('3')).equal(0);
      expect(sink.totalReloads).equal(2);
      expect(sink.totalReloadWallMs).equal(150);
    });

    it('should count retries and out-of-memory restarts', () => {
      sink.recordRetry();
      sink.recordRetry();
      sink.recordOomRestart();

      expect(sink.retries).equal(2);
      expect(sink.oomRestarts).equal(1);
    });

    it('should not record worker activity before the mutation phase starts', () => {
      sink.recordWorkerActivity('0', 100, 10);

      expect(sink.workers()).deep.equal([]);
    });

    it('should aggregate worker activity once the mutation phase started', () => {
      sink.beginMutationPhase();
      sink.recordWorkerActivity('0', 100, 10);
      sink.recordWorkerActivity('0', 50, 5);
      sink.recordWorkerActivity('1', 20, 200);

      expect(sink.workers()).deep.equal([
        { id: '0', mutantsHandled: 2, busyWallMs: 150, idleWallMs: 15 },
        { id: '1', mutantsHandled: 1, busyWallMs: 20, idleWallMs: 200 },
      ]);
    });
  });

  describe('when disabled', () => {
    let sink: PerformanceMetricsSink;

    beforeEach(() => {
      sink = new PerformanceMetricsSink(false);
      sink.beginMutationPhase();
    });

    it('should not record anything', () => {
      sink.recordReload('1', 100);
      sink.recordRetry();
      sink.recordOomRestart();
      sink.recordWorkerActivity('0', 100, 10);

      expect(sink.didReload('1')).false;
      expect(sink.reloadMsFor('1')).equal(0);
      expect(sink.retries).equal(0);
      expect(sink.oomRestarts).equal(0);
      expect(sink.workers()).deep.equal([]);
    });
  });
});
