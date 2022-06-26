import type { JestEnvironment, EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import type { Circus } from '@jest/types';
import { InstrumenterContext } from '@stryker-mutator/api/core';

import { state } from './messaging.js';

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
      // private readonly strykerFileName: string;

      /**
       * The shared instrumenter context with the test environment (the `__stryker__` global variable)
       */
      private readonly strykerContext: InstrumenterContext;

      public static readonly [STRYKER_JEST_ENV] = true;

      constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
        super(config, context);
        this.strykerContext = this.global[this.global.__strykerGlobalNamespace__ ?? '__stryker__'] = state.instrumenterContext;
        state.testFilesWithStrykerEnvironment.add(context.testPath);
      }

      public handleTestEvent: Circus.EventHandler = async (event: Circus.Event, eventState: Circus.State) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await super.handleTestEvent?.(event as any, eventState);
        if (state.coverageAnalysis === 'perTest') {
          if (event.name === 'test_start') {
            this.strykerContext.currentTestId = fullName(event.test);
          } else if (event.name === 'test_done') {
            this.strykerContext.currentTestId = undefined;
          }
        }
      };
    }
    return StrykerJestEnvironment;
  }
}
