import path from 'path';

import { expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';
import { Request, NextFunction, Response } from 'express';
import sinon from 'sinon';

import { TestHooksMiddleware, TEST_HOOKS_FILE_NAME } from '../../../src/karma-plugins/test-hooks-middleware';

describe(TestHooksMiddleware.name, () => {
  let sut: TestHooksMiddleware;

  beforeEach(() => {
    sut = new TestHooksMiddleware();
  });

  describe('configureCoverageAnalysis', () => {
    it('should set __strykerShouldReportCoverage__ to false if coverage analysis is "off"', () => {
      sut.configureCoverageAnalysis('off');
      expect(sut.currentTestHooks).contains('window.__strykerShouldReportCoverage__ = false');
    });
    it('should set __strykerShouldReportCoverage__ to true if coverage analysis is not "off"', () => {
      sut.configureCoverageAnalysis('all');
      expect(sut.currentTestHooks).contains('window.__strykerShouldReportCoverage__ = true');
    });

    describe('perTest', () => {
      it('should throw if the current test framework is not supported', () => {
        sut.configureTestFramework(['chai', 'requirejs', 'tap']); // "tap" is not yet supported
        expect(() => sut.configureCoverageAnalysis('perTest')).throws(
          'Could not configure coverageAnalysis "perTest". Your test framework is not supported by the `@stryker-mutator/karma-runner`. Supported test frameworks: mocha, jasmine'
        );
      });

      it('should should set a jasmine reporter if current testFramework is "jasmine"', () => {
        sut.configureTestFramework(['chai', 'jasmine', 'requirejs']);
        sut.configureCoverageAnalysis('perTest');
        expect(sut.currentTestHooks)
          .contains('window.__strykerShouldReportCoverage__ = true')
          .contains('window.__stryker__.currentTestId = spec.id')
          .and.contains('jasmine.getEnv().addReporter(')
          .and.not.contains('beforeEach(function() {');
      });

      it('should should set a beforeEach hook if current testFramework is "mocha"', () => {
        sut.configureTestFramework(['chai', 'mocha', 'requirejs']);
        sut.configureCoverageAnalysis('perTest');
        expect(sut.currentTestHooks)
          .contains('window.__strykerShouldReportCoverage__ = true')
          .contains('window.__stryker__.currentTestId = this.currentTest && this.currentTest.fullTitle()')
          .and.contains('beforeEach(function() {')
          .and.not.contains('jasmine.getEnv().addReporter(');
      });
    });
  });

  describe('configureActiveMutant', () => {
    it('should set __strykerShouldReportCoverage__ to false', () => {
      sut.configureActiveMutant(factory.mutantRunOptions());
      expect(sut.currentTestHooks).contains('window.__strykerShouldReportCoverage__ = false');
    });

    it('should declare the __stryker__ namespace', () => {
      sut.configureActiveMutant(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '42' }) }));
      expect(sut.currentTestHooks).contains('window.__stryker__ = window.__stryker__ || {}');
    });

    it('should set the "activeMutant" id', () => {
      sut.configureActiveMutant(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '42' }) }));
      expect(sut.currentTestHooks).contains('window.__stryker__.activeMutant = "42"');
    });

    it("should ignore the test filter if the current test framework doesn't support it", () => {
      sut.configureActiveMutant(factory.mutantRunOptions({ testFilter: ['fooSpec'] }));
      expect(sut.currentTestHooks).not.contains('fooSpec');
    });

    it('should set the jasmine specFilter if the current testFramework is "jasmine"', () => {
      sut.configureTestFramework(['jasmine']);
      sut.configureActiveMutant(factory.mutantRunOptions({ testFilter: ['fooSpec', 'barSpec'] }));
      expect(sut.currentTestHooks)
        .contains('jasmine.getEnv().configure({ specFilter: function(spec) {')
        .contains('return ["fooSpec","barSpec"].indexOf(spec.id) !== -1');
    });
    it('should use mocha\'s `grep` to filter tests if the current testFramework is "mocha"', () => {
      sut.configureTestFramework(['mocha']);
      sut.configureActiveMutant(factory.mutantRunOptions({ testFilter: ['fooSpec', 'barSpec'] }));
      expect(sut.currentTestHooks).contains('mocha.grep(/(fooSpec)|(barSpec)/)');
    });
    it("should escape RegExp special characters while while configuring mocha's grep", () => {
      sut.configureTestFramework(['mocha']);
      sut.configureActiveMutant(factory.mutantRunOptions({ testFilter: ['foo.spec', 'bar?spec'] }));
      expect(sut.currentTestHooks).contains('mocha.grep(/(foo\\.spec)|(bar\\?spec)/)');
    });
    it('should escape `/` in the regex literal', () => {
      sut.configureTestFramework(['mocha']);
      sut.configureActiveMutant(
        factory.mutantRunOptions({ testFilter: ['MutationTestReportTotalsComponent should show N/A when no mutation score is available'] })
      );
      expect(sut.currentTestHooks).contains(
        'mocha.grep(/(MutationTestReportTotalsComponent should show N\\/A when no mutation score is available)/)'
      );
    });
  });

  describe('handler', () => {
    let request: Request;
    let response: Response;
    let next: NextFunction;

    beforeEach(() => {
      request = {
        url: '',
      } as Request;
      response = ({
        writeHead: sinon.stub(),
        end: sinon.stub(),
      } as unknown) as Response;
      next = sinon.stub();
    });

    it('should pass through normal requests', () => {
      request.url = '/karma/base.js';
      sut.handler(request, response, next);
      expect(next).called;
      expect(response.writeHead).not.called;
    });

    it('should pass serve "currentTestHooks" when called with the correct url', () => {
      sut.currentTestHooks = 'foo test hooks';
      request.url = `/absolute${path.basename(TEST_HOOKS_FILE_NAME)}?foo=bar`;
      sut.handler(request, response, next);
      expect(next).not.called;
      expect(response.writeHead).calledWith(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/javascript',
      });
      expect(response.end).calledWith('foo test hooks');
    });
  });
});
