import fs from 'fs';
import os from 'os';
import path from 'path';

import { commonTokens } from '@stryker-mutator/api/plugin';
import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { JestOptions } from '../../src-generated/jest-runner-options.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options.js';
import { jestTestRunnerFactory } from '../../src/jest-test-runner.js';
import { createJestOptions } from '../helpers/producers.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('custom testEnvironment with <rootDir>', () => {
  function createSut(overrides?: Partial<JestOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions =
      factory.strykerWithPluginOptions({
        jest: createJestOptions(overrides),
      });
    return testInjector.injector
      .provideValue(commonTokens.options, options)
      .injectFunction(jestTestRunnerFactory);
  }

  it('should instantiate a custom testEnvironment resolved from <rootDir> when coverageAnalysis is "perTest"', async () => {
    const markerFile = path.join(
      os.tmpdir(),
      `stryker-jest-custom-env-${process.pid}.log`,
    );
    fs.writeFileSync(markerFile, '');
    process.env.STRYKER_JEST_CUSTOM_ENV_MARKER = markerFile;
    process.chdir(resolveTestResource('custom-env-rootdir'));

    try {
      const sut = createSut({ enableFindRelatedTests: false });
      await sut.init();
      const result = await sut.dryRun(
        factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
      );

      assertions.expectCompleted(result);
      expect(result.tests).lengthOf(1);
      expect(fs.readFileSync(markerFile, 'utf8')).contains('constructed');
    } finally {
      delete process.env.STRYKER_JEST_CUSTOM_ENV_MARKER;
      fs.rmSync(markerFile, { force: true });
    }
  });
});
