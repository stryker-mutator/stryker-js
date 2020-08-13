import sinon from 'sinon';

export function createRunDetails(): jasmine.RunDetails {
  return {
    failedExpectations: [],
    order: {
      random: false,
      seed: '12foo',
      sort: (_) => _,
    } as jasmine.Order,
  };
}

export function createCustomReporterResult(overrides?: Partial<jasmine.CustomReporterResult>): jasmine.CustomReporterResult {
  return {
    description: 'should have bar',
    fullName: 'Foo should have bar',
    id: 'spec0',
    ...overrides,
  };
}

export function createEnvStub(): sinon.SinonStubbedInstance<jasmine.Env> {
  return {
    currentSpec: sinon.stub(),
    matchersClass: sinon.stub(),
    version: sinon.stub(),
    versionString: sinon.stub(),
    nextSpecId: sinon.stub(),
    addReporter: sinon.stub(),
    execute: sinon.stub(),
    describe: sinon.stub(),
    beforeEach: sinon.stub(),
    beforeAll: sinon.stub(),
    currentRunner: sinon.stub(),
    afterEach: sinon.stub(),
    afterAll: sinon.stub(),
    xdescribe: sinon.stub(),
    it: sinon.stub(),
    xit: sinon.stub(),
    compareRegExps_: sinon.stub(),
    compareObjects_: sinon.stub(),
    equals_: sinon.stub(),
    contains_: sinon.stub(),
    addCustomEqualityTester: sinon.stub(),
    addMatchers: sinon.stub(),
    specFilter: sinon.stub(),
    throwOnExpectationFailure: sinon.stub(),
    stopOnSpecFailure: sinon.stub(),
    seed: sinon.stub(),
    provideFallbackReporter: sinon.stub(),
    throwingExpectationFailures: sinon.stub(),
    allowRespy: sinon.stub(),
    randomTests: sinon.stub(),
    randomizeTests: sinon.stub(),
    clearReporters: sinon.stub(),
    configure: sinon.stub(),
  };
}
