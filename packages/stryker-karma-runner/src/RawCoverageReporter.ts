import { CoverageCollection, CoverageCollectionPerTest } from 'stryker-api/test_runner';

class RawCoverageReporter {
  static $inject = ['emitter'];

  public adapters: any[] = [];

  constructor(private emitter: NodeJS.EventEmitter) { }

  public onBrowserComplete(browser: any, result: { coverage: CoverageCollection | CoverageCollectionPerTest }) {
    this.emitter.emit('raw_coverage_complete', result.coverage);
  }
}

module.exports = {
  'reporter:rawCoverage': ['type', RawCoverageReporter]
};