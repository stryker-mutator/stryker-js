---
title: Plugins
custom_edit_url: https://github.com/stryker-mutator/stryker/edit/master/docs/api/plugins.md
---

You can extend Stryker with 3 plugin kinds:

```ts
export enum PluginKind {
  Checker = 'Checker',
  TestRunner = 'TestRunner',
  Reporter = 'Reporter',
}
```

They are loaded using the [`plugins` configuration option](https://github.com/stryker-mutator/stryker/tree/master/packages/core#plugins-string)

Each plugin has it's own job to do. For inspiration, check out the [stryker monorepo](https://github.com/stryker-mutator/stryker/tree/master/packages).

## Creating a plugin

Creating plugins is best done with typescript, as that will help you a lot with type safety.
We provide the `@stryker-mutator/api` dependency on the types and basic helper functionality. Install it with: `npm install @stryker-mutator/api`.

Next, you need to create a class that _is the actual plugin_. For example:

```ts
import { TestRunner, DryRunResult, DryRunOptions, MutantRunOptions, MutantRunResult } from '@stryker-mutator/api/test-runner';

class FooTestRunner implements TestRunner {
  public init(): Promise<void> {
    // TODO: Implement or remove
  }
  
  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
   // TODO: Implement
  }
  
  public mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    // TODO: Implement
  }
  
  public dispose(): Promise<void> {
   // TODO: Implement or remove
  }
}
```

In this example, a `TestRunner` plugin is constructed. Each plugin kind has it's own interface, so it's easy to create.

After that, you're ready to declare your plugin.

## Declaring your plugin

You can either declare it as a factory method or a class.

A class example:

```ts
import FooTestRunner from './foo-test-runner';
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [declareClassPlugin(PluginKind.TestRunner, 'foo', FooTestRunner)];
```

A factory method example (useful when you want to inject additional values/classes into the DI system):

```ts
import FooTestRunner from './foo-test-runner';
import FooTestRunnerConfigFileLoader from './foo-test-runner-config-file-loader';
import { configLoaderToken, processEnvToken, fooTestRunnerVersionToken } from './plugin-tokens';
import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

const createFooTestRunner = createFooTestRunnerFactory();

export function createFooTestRunnerFactory() {
  createFooTestRunner.inject = tokens(commonTokens.injector);
  function createFooTestRunner(injector: Injector<PluginContext>): FooTestRunner {
    return injector
      .provideValue(processEnvToken, process.env)
      .provideValue(fooTestRunnerVersionToken, require('fooTestRunner/package.json').version as string)
      .provideClass(configLoaderToken, FooTestRunnerConfigFileLoader)
      .injectClass(FooTestRunner);
  }
  return createFooTestRunner;
}

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'foo', createFooTestRunner)];
```

## Dependency injection

Stryker uses [typed-inject](https://github.com/nicojs/typed-inject#readme) as a [dependency injection framework](https://medium.com/@jansennico/advanced-typescript-type-safe-dependency-injection-873426e2cc96).
You can use it as well in your plugin.

See this example below. Here, a `Logger`, `StrykerOptions` and the custom _(factory method plugin declaration required)_ `processEnvToken`, `fooTestRunnerVersionToken` and `configLoaderToken` tokens are injected.

```ts
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { TestRunner, DryRunResult, DryRunOptions, MutantRunOptions, MutantRunResult } from '@stryker-mutator/api/test-runner';
import { I } from '@stryker-mutator/util';
import { configLoaderToken, processEnvToken, fooTestRunnerVersionToken } from './plugin-tokens';
import FooTestRunnerConfigFileLoader from './foo-test-runner-config-file-loader';

class FooTestRunner implements TestRunner {
  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    configLoaderToken,
    processEnvToken,
    fooTestRunnerVersionToken
  );
  
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly configLoader: I<FooTestRunnerConfigFileLoader>,
    private readonly processEnvRef: NodeJS.ProcessEnv,
    private readonly fooTestRunnerVersion: string
  ) { }

  public init(): Promise<void> {
    // TODO: Implement or remove
  }
  
  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
   // TODO: Implement
  }
  
  public mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    // TODO: Implement
  }
  
  public dispose(): Promise<void> {
   // TODO: Implement or remove
  }
}
```

This is type-safe. When you declare your plugin, TypedInject will validate that you don't inject something that cannot be resolved at runtime.

## What's next?

If you need some help, please let us know on [Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM).
