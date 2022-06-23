import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, PluginContext } from '@stryker-mutator/api/plugin';
import sinon from 'sinon';
import { Injector, createInjector } from 'typed-inject';

import * as factory from './factory.js';

class TestInjector {
  public options!: StrykerOptions;
  public logger!: sinon.SinonStubbedInstance<Logger>;
  public injector!: Injector<PluginContext>;
  public fileDescriptions!: FileDescriptions;

  public reset() {
    this.fileDescriptions = Object.create(null);
    this.options = factory.strykerOptions();
    this.logger = factory.logger();
    this.injector = createInjector()
      .provideValue(commonTokens.getLogger, () => this.logger)
      .provideValue(commonTokens.logger, this.logger)
      .provideValue(commonTokens.options, this.options)
      .provideValue(commonTokens.fileDescriptions, this.fileDescriptions);
  }
}

export const testInjector = new TestInjector();
testInjector.reset();
