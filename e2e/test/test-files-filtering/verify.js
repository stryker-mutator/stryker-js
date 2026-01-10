import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Stryker from '@stryker-mutator/core';

use(chaiAsPromised);

describe('Filtering tests with --testFiles', () => {
  describe('using "command" test runner', () => {
    it('should throw an error when testFiles is provided', async () => {
      const stryker = new Stryker({
        testRunner: 'command',
        testFiles: ['test/vitest/math.spec.js'],
        plugins: ['@stryker-mutator/core'],
        commandRunner: { command: 'echo pass' },
      });

      await expect(stryker.runMutationTest()).to.be.rejectedWith(
        'The command test runner does not support the --testFiles option.',
      );
    });
  });

  describe('using "vitest" test runner', () => {
    it('should kill the mutant when testFiles includes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'vitest',
        testFiles: ['test/vitest/math.spec.js'],
        mutate: ['src/math.js'],
        concurrency: 1,
        plugins: ['@stryker-mutator/vitest-runner'],
        vitest: {
          configFile: 'vitest.config.js',
        },
      });

      const result = await stryker.runMutationTest();
      expect(result.length).to.be.greaterThan(0); // Mutants found
      const killedMutant = result.find((m) => m.status === 'Killed');
      expect(killedMutant, 'Expected at least one killed mutant').to.not.be
        .undefined;
    });

    it('should let the mutant survive when testFiles excludes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'vitest',
        testFiles: ['test/vitest/survive.spec.js'],
        mutate: ['src/math.js'],
        concurrency: 1,
        plugins: ['@stryker-mutator/vitest-runner'],
        vitest: {
          configFile: 'vitest.config.js',
        },
      });

      const result = await stryker.runMutationTest();
      const survivedMutant = result.find((m) => m.status === 'Survived');
      expect(survivedMutant, 'Expected the mutant to survive').to.not.be
        .undefined;
    });
  });

  describe('using "jest" test runner', () => {
    it('should kill the mutant when testFiles includes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'jest',
        testFiles: ['test/jest/math.spec.js'],
        mutate: ['src/math.cjs'],
        concurrency: 1,
        plugins: ['@stryker-mutator/jest-runner'],
        jest: {
          configFile: 'jest.config.js',
        },
      });

      const result = await stryker.runMutationTest();
      expect(result.length).to.be.greaterThan(0);
      const killedMutant = result.find((m) => m.status === 'Killed');
      expect(killedMutant, 'Expected at least one killed mutant').to.not.be
        .undefined;
    });

    it('should let the mutant survive when testFiles excludes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'jest',
        testFiles: ['test/jest/survive.spec.js'],
        mutate: ['src/math.cjs'],
        concurrency: 1,
        plugins: ['@stryker-mutator/jest-runner'],
        jest: {
          configFile: 'jest.config.js',
        },
      });

      const result = await stryker.runMutationTest();
      const survivedMutant = result.find((m) => m.status === 'Survived');
      expect(survivedMutant, 'Expected the mutant to survive').to.not.be
        .undefined;
    });
  });

  describe('using "mocha" test runner', () => {
    it('should kill the mutant when testFiles includes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'mocha',
        testFiles: ['test/mocha/math.spec.cjs'],
        mutate: ['src/math.cjs'],
        concurrency: 1,
        plugins: ['@stryker-mutator/mocha-runner'],
      });

      const result = await stryker.runMutationTest();
      expect(result.length).to.be.greaterThan(0);
      const killedMutant = result.find((m) => m.status === 'Killed');
      expect(killedMutant, 'Expected at least one killed mutant').to.not.be
        .undefined;
    });

    it('should let the mutant survive when testFiles excludes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'mocha',
        testFiles: ['test/mocha/survive.spec.cjs'],
        mutate: ['src/math.cjs'],
        concurrency: 1,
        plugins: ['@stryker-mutator/mocha-runner'],
      });

      const result = await stryker.runMutationTest();
      const survivedMutant = result.find((m) => m.status === 'Survived');
      expect(survivedMutant, 'Expected the mutant to survive').to.not.be
        .undefined;
    });
  });

  describe('using "jasmine" test runner', () => {
    it('should kill the mutant when testFiles includes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'jasmine',
        testFiles: ['test/jasmine/math.spec.js'],
        mutate: ['src/math.js'],
        concurrency: 1,
        plugins: ['@stryker-mutator/jasmine-runner'],
      });

      const result = await stryker.runMutationTest();
      expect(result.length).to.be.greaterThan(0);
      const killedMutant = result.find((m) => m.status === 'Killed');
      expect(killedMutant, 'Expected at least one killed mutant').to.not.be
        .undefined;
    });

    it('should let the mutant survive when testFiles excludes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'jasmine',
        testFiles: ['test/jasmine/survive.spec.js'],
        mutate: ['src/math.js'],
        concurrency: 1,
        plugins: ['@stryker-mutator/jasmine-runner'],
      });

      const result = await stryker.runMutationTest();
      const survivedMutant = result.find((m) => m.status === 'Survived');
      expect(survivedMutant, 'Expected the mutant to survive').to.not.be
        .undefined;
    });
  });

  describe('using "tap" test runner', () => {
    it('should kill the mutant when testFiles includes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'tap',
        testFiles: ['test/tap/math.spec.js'],
        mutate: ['src/math.js'],
        concurrency: 1,
        plugins: ['@stryker-mutator/tap-runner'],
      });

      const result = await stryker.runMutationTest();
      expect(result.length).to.be.greaterThan(0);
      const killedMutant = result.find((m) => m.status === 'Killed');
      expect(killedMutant, 'Expected at least one killed mutant').to.not.be
        .undefined;
    });

    it('should let the mutant survive when testFiles excludes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'tap',
        testFiles: ['test/tap/survive.spec.js'],
        mutate: ['src/math.js'],
        concurrency: 1,
        plugins: ['@stryker-mutator/tap-runner'],
      });

      const result = await stryker.runMutationTest();
      const survivedMutant = result.find(
        (m) => m.status === 'Survived' || m.status === 'NoCoverage',
      );

      expect(survivedMutant, 'Expected the mutant to survive').to.not.be
        .undefined;
    });
  });

  describe('using "cucumber" test runner', () => {
    it('should kill the mutant when testFiles includes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'cucumber',
        testFiles: ['test/cucumber/features/math.feature'],
        mutate: ['src/math.js'],
        concurrency: 1,
        plugins: ['@stryker-mutator/cucumber-runner'],
        cucumber: {
          features: ['test/cucumber/features/**/*.feature'],
        },
      });

      const result = await stryker.runMutationTest();
      expect(result.length).to.be.greaterThan(0);
      const killedMutant = result.find((m) => m.status === 'Killed');
      expect(killedMutant, 'Expected at least one killed mutant').to.not.be
        .undefined;
    });

    it('should let the mutant survive when testFiles excludes the identifying test', async () => {
      const stryker = new Stryker({
        testRunner: 'cucumber',
        testFiles: ['test/cucumber/features/survive.feature'],
        mutate: ['src/math.js'],
        concurrency: 1,
        plugins: ['@stryker-mutator/cucumber-runner'],
        cucumber: {
          features: ['test/cucumber/features/**/*.feature'],
        },
      });

      const result = await stryker.runMutationTest();
      const survivedMutant = result.find((m) => m.status === 'Survived');
      expect(survivedMutant, 'Expected the mutant to survive').to.not.be
        .undefined;
    });
  });

  describe('using "karma" test runner', () => {
    it('should throw an error when testFiles is provided', async () => {
      const stryker = new Stryker({
        testRunner: 'karma',
        testFiles: ['test/karma/math.spec.js'],
        plugins: ['@stryker-mutator/karma-runner'],
      });

      await expect(stryker.runMutationTest()).to.be.rejectedWith(
        'The karma test runner does not support the --testFiles option.',
      );
    });
  });
});
