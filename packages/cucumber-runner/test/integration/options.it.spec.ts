import path from 'path';

import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import * as pluginTokens from '../../src/plugin-tokens.js';
import { CucumberTestRunner } from '../../src/index.js';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('Cucumber runner options integration', () => {
  let options: CucumberRunnerWithStrykerOptions;
  let sut: CucumberTestRunner;
  const fooFeature = path.join('features', 'foo.feature');
  const barFeature = path.join('features', 'bar.feature');

  beforeEach(() => {
    options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    process.chdir(resolveTestResource('options'));
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });

  describe('tags', () => {
    it('should allow a single tag', async () => {
      options.cucumber.tags = ['@foo'];
      const result = await sut.dryRun(factory.dryRunOptions());
      assertions.expectTestResults(result, [
        { id: `${fooFeature}:4` },
        { id: `${fooFeature}:13` },
        { id: `${fooFeature}:14` },
      ]);
    });
    it('should allow a multiple tags', async () => {
      options.cucumber.tags = ['@bar', '@bar-rule'];
      const result = await sut.dryRun(factory.dryRunOptions());
      assertions.expectTestResults(result, [
        {
          id: `${barFeature}:19`,
          name: 'Feature: Bar -- Rule: When bar is baz -- Example: then bar is baz',
        },
      ]);
    });
  });

  describe('profile', () => {
    it('should support selecting a profile', async () => {
      options.cucumber.profile = 'bar';
      const result = await sut.dryRun(factory.dryRunOptions());
      assertions.expectTestResults(result, [
        { id: `${barFeature}:4` },
        { id: `${barFeature}:13` },
        { id: `${barFeature}:14` },
        { id: `${barFeature}:19` },
      ]);
    });
  });

  describe('features', () => {
    it('should support selecting specific features', async () => {
      options.cucumber.features = ['features/bar.feature'];
      const result = await sut.dryRun(factory.dryRunOptions());
      assertions.expectTestResults(result, [
        { id: `${barFeature}:4` },
        { id: `${barFeature}:13` },
        { id: `${barFeature}:14` },
        { id: `${barFeature}:19` },
      ]);
    });
    it('should be able to filter tests when providing features', async () => {
      options.cucumber.features = [
        'features/bar.feature',
        'features/foo.feature',
      ];
      const result = await sut.mutantRun(
        factory.mutantRunOptions({
          testFilter: [`${barFeature}:14`],
        })
      );
      assertions.expectKilled(result);
      expect(result.nrOfTests).eq(1);
    });
  });
});
