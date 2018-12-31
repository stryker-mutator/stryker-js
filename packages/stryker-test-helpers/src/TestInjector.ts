import { Injectable, InjectorKey, PluginResolver } from 'stryker-api/di';
import { StrykerOptions } from 'stryker-api/core';
import { Logger } from 'stryker-api/logging';
import { logger, strykerOptions } from './factory';
import * as sinon from 'sinon';

export default class TestInjector {
  public static options: Partial<StrykerOptions> = {};
  public static logger: sinon.SinonStubbedInstance<Logger>;
  public static pluginResolver: sinon.SinonStubbedInstance<PluginResolver>;
  public static replacements: Map<Injectable<any, any>, any> = new Map();

  public static reset() {
    this.options = {};
    this.logger = logger();
    this.pluginResolver = {
      resolve: sinon.stub()
    };
    this.replacements.clear();
  }

  public static stub<T, TArgs extends InjectorKey[]>(Injectable: Injectable<T, TArgs>, replacement: T): typeof TestInjector {
    this.replacements.set(Injectable, replacement);
    return this;
  }

  public static inject<T, TArgs extends InjectorKey[]>(Injectable: Injectable<T, TArgs>): T {
    if (this.replacements.has(Injectable)) {
      return this.replacements.get(Injectable);
    } else {
      const args: any = Injectable.inject.map(key => {
        switch (key) {
          case 'options':
            return strykerOptions(this.options);
          case 'logger':
            return this.logger;
          case 'pluginResolver':
            return this.pluginResolver;
          case 'inject':
            return this.inject.bind(this);
          default:
            throw new Error(`Injecting "${key}" is not (yet) supported by the ${TestInjector.name}`);
        }
      });
      return new Injectable(...args);
    }
  }
}

TestInjector.reset();
