import type { JestEnvironment, EnvironmentContext } from '@jest/environment';
import type { Config, Circus } from '@jest/types';
import { InstrumenterContext } from '@stryker-mutator/api/core';

import { state } from '../messaging';

function fullNameDescribeBlock(describe: Circus.DescribeBlock): string {
  if (describe.parent) {
    const parentName = fullNameDescribeBlock(describe.parent);
    return `${parentName} ${describe.name}`.trimStart();
  } else {
    return ''; // describe.name === "ROOT_DESCRIBE_BLOCK"
  }
}

function fullName(test: Circus.TestEntry): string {
  const suiteName = fullNameDescribeBlock(test.parent);
  return `${suiteName} ${test.name}`.trimStart();
}

const STRYKER_JEST_ENV = Symbol('StrykerJestEnvironment');

export function mixinJestEnvironment<T extends typeof JestEnvironment>(JestEnvironmentClass: T & { [STRYKER_JEST_ENV]?: true }): T {
  if (JestEnvironmentClass[STRYKER_JEST_ENV]) {
    return JestEnvironmentClass;
  } else {
    class StrykerJestEnvironment extends JestEnvironmentClass {
      private readonly fileName: string;

      /**
       * The shared instrumenter context with the test environment (the `__stryker__` global variable)
       */
      private readonly context: InstrumenterContext;

      public static readonly [STRYKER_JEST_ENV] = true;

      constructor(config: Config.ProjectConfig, context?: EnvironmentContext) {
        super(config, context);
        this.fileName = context!.testPath!;
        this.context = this.global[this.global.__strykerGlobalNamespace__] = this.global[this.global.__strykerGlobalNamespace__] ?? {};
      }

      public handleTestEvent: Circus.EventHandler = async (event: Circus.Event, eventState: Circus.State) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await super.handleTestEvent?.(event as any, eventState);
        if (state.coverageAnalysis === 'perTest' && event.name === 'test_start') {
          this.context.currentTestId = fullName(event.test);
        }
      };

      public async teardown() {
        const mutantCoverage = this.context.mutantCoverage;
        state.hitCount = this.context.hitCount;
        state.hitLimit = this.context.hitLimit;
        state.handleMutantCoverage(this.fileName, mutantCoverage);
        await super.teardown();
      }

      public async setup() {
        await super.setup();
        if (state.firstTestFile) {
          this.context.hitCount = 0;
          this.context.hitLimit = state.hitLimit;
          state.firstTestFile = false;
        }
      }
    }
    return StrykerJestEnvironment;
  }
}
