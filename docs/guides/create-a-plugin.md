---
title: Create a plugin
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/guides/create-a-plugin.md
---

You can extend Stryker with the following plugin kinds:

```ts
export enum PluginKind {
  Checker = 'Checker',
  TestRunner = 'TestRunner',
  Reporter = 'Reporter',
}
```

They are loaded using the [`plugins` configuration option](../configuration#plugins-string)

Each plugin has it's own job to do. For inspiration, check out the [stryker monorepo](https://github.com/stryker-mutator/stryker-js/tree/master/packages).

## Creating a plugin

Creating plugins is best done with typescript, as that will help you a lot with type safety and intellisense.
We provide the `@stryker-mutator/api` dependency on the types and basic helper functionality. This should be installed as a `dependency` of your plugin. 

```shell
npm install @stryker-mutator/api
```

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

In this example, a `TestRunner` plugin is constructed. Each plugin kind has it's own interface, so it is easy to get started with a skeleton implementation.

After you've created your skeleton plugin, you're ready to declare it.

## Declaring your plugin

In order to make your plugin known to Stryker, you should export the declaration of your plugin. You can either declare it as a factory method or a class. 
Stryker will take care of creating your plugin implementation at the correct moment in the Stryker lifecycle. 

A class example:

```ts
// index.ts
import FooTestRunner from './foo-test-runner';
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [declareClassPlugin(PluginKind.TestRunner, 'foo', FooTestRunner)];
```

A factory method example (useful when you want to inject additional values/classes into the DI system):

```ts
// index.ts
import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import FooTestRunner from './foo-test-runner.js';
import FooTestRunnerConfigFileLoader from './foo-test-runner-config-file-loader.js';
import { configLoaderToken, processEnvToken } from './plugin-tokens.js';

const createFooTestRunner = createFooTestRunnerFactory();

export function createFooTestRunnerFactory() {
  fooTestRunnerFactory.inject = tokens(commonTokens.injector);
  function fooTestRunnerFactory(injector: Injector<PluginContext>): FooTestRunner {
    return injector
      .provideValue(processEnvToken, process.env)
      .provideClass(configLoaderToken, FooTestRunnerConfigFileLoader)
      .injectClass(FooTestRunner);
  }
  return fooTestRunnerFactory;
}

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'foo', createFooTestRunner)];
```

Now you're ready to test out your plugin!

## Test your plugin

It is easy to test your plugin on a test project by loading it via the plugins section.

For example, when your test project resides next to your plugin implementation:

```js
{
  // name of your test runner
  "testRunner": "foo", 
  // name of your checker
  "checkers": ["bar"], 
  // name your reporter
  "reporters": ["progress", "my-reporter"], 
  // load your test runner, reporter or checker plugin here
  "plugins": ["@stryker-mutator/*", "../my-plugin"], 
  // useful for debugging your 
  "concurrency": 1, 
  // useful for debugging your test runner plugin
  "testRunnerNodeArgs": ["--inspect"], 
  // useful for debugging your checker plugin
  "checkerNodeArgs": ["--inspect"]
};
```

**Note: Be sure you have compiled your TypeScript correctly.**

You can test it out with StrykerJS:

```shell
npx stryker run
```

Test runner and checker plugins are actually created in its own child process. Therefore you cannot debug them directly. Instead you can use the `testRunnerNodeArgs: ['--inspect']` or `checkerNodeArgs: ['--inspect']` to debug your test runner or respectively plugin respectively.

After you've verified that your plugin loads correctly, it is recommended to create your own integration tests and not rely on Stryker to test it out each time. This will allow you to develop your plugin faster.

## Dependency injection

Stryker uses [typed-inject](https://github.com/nicojs/typed-inject#readme) as a [dependency injection (DI) framework](https://medium.com/@jansennico/advanced-typescript-type-safe-dependency-injection-873426e2cc96).
It is recommended that you also use this as your DI framework inside the plugin.

See this example below. 

```ts
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, PluginContext } from '@stryker-mutator/api/plugin';
import { TestRunner, DryRunResult, DryRunOptions, MutantRunOptions, MutantRunResult, TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';
import * as pluginTokens from './plugin-tokens';
import FooTestRunnerConfigFileLoader from './foo-test-runner-config-file-loader';

export class FooTestRunner implements TestRunner {
  public static inject = [
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.configLoader,
    pluginTokens.processEnv
  ] as const;
  
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly configLoader: FooTestRunnerConfigFileLoader,
    private readonly processEnvRef: NodeJS.ProcessEnv,
  ) { }

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: false };
  }

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


export function fooTestRunnerFactory(injector: Injector<PluginContext>) {
  return injector
    .provideValue(pluginTokens.processEnv, process.env)
    .provideClass(pluginTokens.configLoader, FooTestRunnerConfigFileLoader)
    .injectClass(FooTestRunner);
}
fooTestRunnerFactory.inject = [commonTokens.injector] as const;
```

In this example, you can see that some tokens are loaded from `commonTokens` and some are loaded from `pluginTokens`.

* `commonTokens`: These contain the tokens belonging to values Stryker itself provide.
* `pluginTokens`: These are an example of tokens you can provide yourself in your plugin. The `fooTestRunnerFactory` factory method is an example of where the tokens are provided.

This is type-safe. When you declare your plugin, TypedInject will validate that you don't inject something that cannot be resolved at runtime.

## What's next?

If you have a plugin that you think other users might be able to benefit from, or you simply need some help, please let us know on [Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM). 

We're always looking to promote user-created plugins 💗

