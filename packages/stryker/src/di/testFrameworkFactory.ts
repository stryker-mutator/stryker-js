import { tokens, OptionsContext, commonTokens } from 'stryker-api/plugin';
import TestFrameworkOrchestrator from '../TestFrameworkOrchestrator';
import { Injector } from 'typed-inject';

export function testFrameworkFactory(injector: Injector<OptionsContext>) {
  injector.injectClass(TestFrameworkOrchestrator).determineTestFramework();
}
testFrameworkFactory.inject = tokens(commonTokens.injector);
