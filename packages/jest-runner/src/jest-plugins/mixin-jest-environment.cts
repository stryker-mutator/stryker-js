import type {
  JestEnvironment,
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import type { Circus } from '@jest/types';
// @ts-expect-error see https://github.com/microsoft/TypeScript/issues/49721#issuecomment-1319854183
import type { InstrumenterContext } from '@stryker-mutator/api/core';

import { state } from './messaging.cjs';

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

export function mixinJestEnvironment<T extends typeof JestEnvironment>(
  JestEnvironmentClass: T & { [STRYKER_JEST_ENV]?: true },
): T {
  if (JestEnvironmentClass[STRYKER_JEST_ENV]) {
    return JestEnvironmentClass;
  } else {
    class StrykerJestEnvironment extends JestEnvironmentClass {
      /**
       * The shared instrumenter context with the test environment (the `__stryker__` global variable)
       */
      readonly #strykerContext: InstrumenterContext;
      readonly #innerHandleTestEvent: JestEnvironment['handleTestEvent'];
      readonly #innerTeardown: JestEnvironment['teardown'];

      public static readonly [STRYKER_JEST_ENV] = true;

      constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
        super(config, context);
        this.#innerHandleTestEvent = this.handleTestEvent; // grab the "handle test event", since it might be a class property
        this.#innerTeardown = this.teardown; // same for "teardown"
        this.#strykerContext = this.global[
          this.global.__strykerGlobalNamespace__ ?? '__stryker__'
        ] = state.instrumenterContext;
        state.testFilesWithStrykerEnvironment.add(context.testPath);

        this.handleTestEvent = (async (
          event: Circus.Event,
          eventState: Circus.State,
        ) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          await this.#innerHandleTestEvent?.(event as any, eventState);
          if (state.coverageAnalysis === 'perTest') {
            if (event.name === 'test_start') {
              this.#strykerContext.currentTestId = fullName(event.test);
            } else if (event.name === 'test_done') {
              this.#strykerContext.currentTestId = undefined;
            }
          }
        }) satisfies Circus.EventHandler;

        this.teardown = async () => {
          await this.#innerTeardown();
          copyCoverageToRunnerRealm(this.#strykerContext);
        };
      }
    }
    return StrykerJestEnvironment;
  }
}

/**
 * The instrumented code creates its coverage objects in the realm of the test file that runs it.
 * Such an object keeps that whole realm alive, so copy it into this realm, since the shared context outlives the test file.
 */
function copyCoverageToRunnerRealm(context: InstrumenterContext): void {
  const coverage = context.mutantCoverage;
  if (coverage) {
    const perTest = ownedByRunner(coverage.perTest);
    if (state.coverageAnalysis === 'perTest') {
      for (const testId in perTest) {
        perTest[testId] = ownedByRunner(perTest[testId]);
      }
    }
    context.mutantCoverage = {
      static: ownedByRunner(coverage.static),
      perTest,
    };
  }
}

function ownedByRunner<T extends object>(value: T): T {
  return Object.getPrototypeOf(value) === Object.prototype
    ? value
    : { ...value };
}
