import type { JestEnvironment, EnvironmentContext } from '@jest/environment';
import type { Config, Circus } from '@jest/types';

import { state } from '../messaging';

function fullNameDescribeBlock(describe: Circus.DescribeBlock): string {
  if (describe.parent) {
    const parentName = fullNameDescribeBlock(describe.parent);
    return `${parentName}${parentName.length > 0 ? ' ' : ''}${describe.name}`;
  } else {
    return ''; // describe.name === "ROOT_DESCRIBE_BLOCK"
  }
}

function fullName(test: Circus.TestEntry): string {
  return `${fullNameDescribeBlock(test.parent)} ${test.name}`;
}

export function mixinJestEnvironment<T extends typeof JestEnvironment>(JestEnvironmentClass: T): T {
  // @ts-expect-error wrong assumption about a mixin class: https://github.com/microsoft/TypeScript/issues/37142
  class StrykerJestEnvironment extends JestEnvironmentClass {
    private readonly fileName: string;

    constructor(config: Config.ProjectConfig, context?: EnvironmentContext) {
      super(config, context);
      this.fileName = context!.testPath!;
    }

    public async handleTestEvent(event: Circus.Event, eventState: Circus.State): Promise<void> {
      await super.handleTestEvent?.(event, eventState);
      if (state.coverageAnalysis === 'perTest' && event.name === 'test_start') {
        const ns = (this.global[this.global.__strykerGlobalNamespace__] = this.global[this.global.__strykerGlobalNamespace__] ?? {});
        ns.currentTestId = fullName(event.test);
      }
    }

    public async teardown() {
      const mutantCoverage = this.global[this.global.__strykerGlobalNamespace__]?.mutantCoverage;
      state.handleMutantCoverage(this.fileName, mutantCoverage);
      await super.teardown();
    }
  }
  return StrykerJestEnvironment;
}
