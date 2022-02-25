import sinon from 'sinon';

export function createJasmineDoneInfo(): jasmine.JasmineDoneInfo {
  return {
    failedExpectations: [],
    overallStatus: '',
    deprecationWarnings: [],
    incompleteReason: '',
    totalTime: 100,
    order: {
      random: false,
      seed: '12foo',
      sort: (_) => _,
    } as jasmine.Order,
  };
}

export function createJasmineStartedInfo(): jasmine.JasmineStartedInfo {
  return {
    totalSpecsDefined: 42,
    order: {
      random: false,
      seed: '12foo',
      sort: (_) => _,
    } as jasmine.Order,
  };
}

export function createSpecResult(overrides?: Partial<jasmine.SpecResult>): jasmine.SpecResult {
  return {
    description: 'should have bar',
    fullName: 'Foo should have bar',
    id: 'spec0',
    deprecationWarnings: [],
    duration: 42,
    failedExpectations: [],
    passedExpectations: [],
    pendingReason: '',
    properties: {},
    status: 'passed',
    ...overrides,
  };
}

export function createSpec(overrides?: Partial<jasmine.Spec>): jasmine.Spec {
  return { id: 'spec1', ...overrides } as jasmine.Spec;
}

export function createEnvStub(): sinon.SinonStubbedInstance<jasmine.Env> {
  return {
    addReporter: sinon.stub(),
    execute: sinon.stub(),
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
    configuration: sinon.stub(),
    hideDisabled: sinon.stub(),
    hidingDisabled: sinon.stub(),
    setSpecProperty: sinon.stub(),
    setSuiteProperty: sinon.stub(),
    topSuite: sinon.stub(),
    stoppingOnSpecFailure: sinon.stub(),
  };
}
