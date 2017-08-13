import { RunnerOptions, RunResult, RunStatus, TestResult, TestRunner, TestStatus } from 'stryker-api/test_runner';
import { EventEmitter } from 'events';

import * as _ from 'lodash';
const os = require('os');
const path = require('path');

import * as log4js from 'log4js';
const log = log4js.getLogger('JestTestRunner');

import { findJestAdapter, JestAdapter } from './JestVersionAdapters';

const DEFAULT_OPTIONS: Object = {
  cacheDirectory: path.join(os.tmpdir(), 'jest'),
  collectCoverage: false,
  haste: {},
  maxWorkers: 1,
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  moduleNameMapper: [],
  setupFiles: [],
  snapshotSerializers: [],
  testEnvironment: 'jest-environment-jsdom',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',
  testRunner: 'jest-jasmine2',
  verbose: true
};

export default class JestTestRunner extends EventEmitter implements TestRunner {
  // Seems there are no up-to-date TypeScript definitions for Jest

  private jestAdapter: JestAdapter;
  private hasteContext: Promise<any>;
  private options: any;
  private paths: string[];

  constructor(options: RunnerOptions) {
    super();
    this.jestAdapter = findJestAdapter();
    log.debug(`Received options ${JSON.stringify(options)}`);

    this.options = _.assign(DEFAULT_OPTIONS, {
      rootDir: process.cwd(),
      testPathDirs: [process.cwd()]
    });
    log.debug(`Using options ${JSON.stringify(this.options)}`);
    
    const _testRegex = new RegExp(this.options.testRegex);
    const isTest = (file: string) => _testRegex.test(file);

    this.paths = options.files
      .map(file => file.path)
      .filter(isTest);

    log.info(`Discovered specs ${JSON.stringify(this.paths)}`);
  }

  init(): Promise<any> | void {
    log.info(`Initializing Jest`);
    this.hasteContext = this.jestAdapter.buildHasteContext(this.options);
  }

  run(): Promise<RunResult> {
    return this.hasteContext
      .then((context: any) => this.runTests(context))
      .then((results: any[]) => this.processJestResults(results))
      .catch((error: Error) => this.catchError(error));
  }

  private runTests(hasteContext: any): Promise<any[]> {
    const promises = this.paths.map((specPath: string) => {
      return this.jestAdapter.runTest(
        path.resolve(specPath),
        this.options,
        hasteContext.resolver
      );
    });
    return Promise.all(promises);
  }

  private catchError(error: Error): RunResult {
    log.error(`An error occured while invoking Jest: ${error.stack}`);
    return {
      coverage: undefined,
      tests: [],
      status: RunStatus.Error,
      errorMessages: [ `${error.name}: ${error.message}` ]
    };
  }

  private processJestResults(results: any): RunResult {
    log.debug(`Jest returned ${JSON.stringify(results.length)} results`);
    const aggregatedResults = results
      .map((result: any) => result.testResults)
      .reduce((result1: any[], result2: any[]) => result1.concat(result2), []);
      
    const tests = this.createTestResults(aggregatedResults);
    const status = RunStatus.Complete;
    const coverage: any = undefined;
    const errorMessages = this.createErrorMessages(aggregatedResults);

    return { tests, status, coverage, errorMessages };
  }

  private createTestResults(results: any[]): TestResult[] {
    return results.map((result: any) => {      
      const name = result.fullName;
      const status = this.createTestStatus(result);
      const timeSpentMs = result.duration;
      const failureMessages = result.failureMessages;

      return { name, status, timeSpentMs, failureMessages };
    });
  }

  private createTestStatus(result: any): TestStatus {
    switch (result.status) {
      case 'passed': return TestStatus.Success;
      case 'failed': return TestStatus.Failed;
      default      : log.warn(`Got unexpected test status ${result.status}`); return null;
    }
  }

  private createErrorMessages(result: any[]): string[] {
    return result.map((r: any) => r.failureMessage).filter(msg => !!msg);
  }

  dispose?(): Promise<any> | void {
    log.info('Disposing');
  }
}
