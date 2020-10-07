import * as path from 'path';
import * as url from 'url';

import { RequestHandler } from 'express';
import { CoverageAnalysis, INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';
import { MutantRunOptions } from '@stryker-mutator/api/test-runner';
import { escapeRegExpLiteral } from '@stryker-mutator/util';

export const TEST_HOOKS_FILE_NAME = __filename;

const SUPPORTED_FRAMEWORKS = Object.freeze(['mocha', 'jasmine'] as const);

type SupportedFramework = 'mocha' | 'jasmine';

function isSupportedFramework(framework: string): framework is SupportedFramework {
  return (SUPPORTED_FRAMEWORKS as readonly string[]).includes(framework);
}

/**
 * Keep in sync with StrykerMutantCoverageAdapter.ts
 */
const SHOULD_REPORT_COVERAGE_FLAG = '__strykerShouldReportCoverage__';

const { ACTIVE_MUTANT, NAMESPACE, CURRENT_TEST_ID } = INSTRUMENTER_CONSTANTS;

export default class TestHooksMiddleware {
  private static _instance?: TestHooksMiddleware;
  private testFramework: 'mocha' | 'jasmine' | undefined;
  public currentTestHooks = '';

  public static get instance(): TestHooksMiddleware {
    if (!this._instance) {
      this._instance = new TestHooksMiddleware();
    }
    return this._instance;
  }

  public configureTestFramework(frameworks?: string[]) {
    this.testFramework = frameworks?.filter(isSupportedFramework)[0];
  }

  public configureCoverageAnalysis(coverageAnalysis: CoverageAnalysis) {
    switch (coverageAnalysis) {
      case 'perTest':
        this.configurePerTestCoverageAnalysis();
        break;
      case 'all':
        this.currentTestHooks = `window.${SHOULD_REPORT_COVERAGE_FLAG} = true;`;
        break;
      case 'off':
        this.currentTestHooks = `window.${SHOULD_REPORT_COVERAGE_FLAG} = false;`;
        break;
    }
  }

  public configureActiveMutant({ activeMutant, testFilter }: MutantRunOptions) {
    this.configureCoverageAnalysis('off');
    this.currentTestHooks += `window.${NAMESPACE} = window.${NAMESPACE} || {};
    window.${NAMESPACE}.${ACTIVE_MUTANT} = ${activeMutant.id};`;
    if (testFilter) {
      switch (this.testFramework) {
        case 'jasmine':
          this.currentTestHooks += `jasmine.getEnv().configure({ specFilter: function(spec) {
            return ${JSON.stringify(testFilter)}.indexOf(spec.id) !== -1;
          }})`;
          break;
        case 'mocha':
          const metaRegExp = testFilter.map((testId) => `(${escapeRegExpLiteral(testId)})`).join('|');
          this.currentTestHooks += `mocha.grep(/${metaRegExp}/)`;
          break;
      }
    }
  }

  private configurePerTestCoverageAnalysis() {
    switch (this.testFramework) {
      case 'jasmine':
        this.currentTestHooks = `
      window.${SHOULD_REPORT_COVERAGE_FLAG} = true;
      jasmine.getEnv().addReporter({
        specStarted: function (spec) {
          window.${NAMESPACE}.${CURRENT_TEST_ID} = spec.id;
        }
      });`;
        break;
      case 'mocha':
        this.currentTestHooks = `
        window.${SHOULD_REPORT_COVERAGE_FLAG} = true;
        beforeEach(function() {
          window.${NAMESPACE}.${CURRENT_TEST_ID} = this.currentTest && this.currentTest.fullTitle();
        });
      `;
        break;
      case undefined:
        throw new Error(
          `Could not configure coverageAnalysis "perTest". Your test framework is not supported by the \`@stryker-mutator/karma-runner\`. Supported test frameworks: ${SUPPORTED_FRAMEWORKS.join(
            ', '
          )}.`
        );
    }
  }

  public handler: RequestHandler = (request, response, next) => {
    const pathName = url.parse(request.url).pathname;
    if (pathName && path.normalize(pathName).endsWith(TEST_HOOKS_FILE_NAME)) {
      response.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/javascript',
      });
      response.end(this.currentTestHooks);
    } else {
      next();
    }
  };
}
