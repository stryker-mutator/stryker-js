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
  Ignore = 'Ignore',
}
```

They are loaded using the [`plugins` configuration option](../configuration.md#plugins-string)

Each plugin has its own job to do. For inspiration, check out the [stryker monorepo](https://github.com/stryker-mutator/stryker-js/tree/master/packages).

## Creating a plugin

Creating plugins is best done with typescript, which will help you immensely with type safety and intellisense.

We provide the `@stryker-mutator/api` dependency on the types and basic helper functionality. You can install this as a dependency on your plugin. 

```shell
npm install @stryker-mutator/api
```

Next, you must create a class that _is the actual plugin_. For example:

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

In this example, a `TestRunner` plugin is constructed. Each plugin kind has its own interface, so getting started with a skeleton implementation is straightforward.

After you've created your skeleton plugin, you're ready to declare it.

## Declaring your plugin

To make your plugin known to Stryker, you should export the declaration of it. You can either declare it as a factory method or a class. 
Stryker will implement your plugin at the right moment in the lifecycle. 

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

A value example (practical for simple plugins, like an [ignore-plugin](../disable-mutants.md#using-an-ignore-plugin))

```ts
// index.ts
import { declareValuePlugin, PluginKind } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [declareValuePlugin(PluginKind.Ignore, 'console', {
  shouldIgnore(path) {
    if (
      path.isExpressionStatement() &&
      path.node.expression.type === 'CallExpression' &&
      path.node.expression.callee.type === 'MemberExpression' &&
      path.node.expression.callee.object.type === 'Identifier' &&
      path.node.expression.callee.object.name === 'console'
    ) {
      return "We're not interested in testing `console.x` statements, see ADR 648.";
    }
  }
})];
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

Test runner and checker plugins get created in their own child process. So you won't be able to debug them directly. Instead, you can use the `testRunnerNodeArgs: ['--inspect']` or `checkerNodeArgs: ['--inspect']` to debug your test runner or plugin, respectively.

After you've verified that your plugin loads correctly, creating your integration tests is recommended, and not relying on Stryker to test it each time. This will allow you to develop your plugin faster.

## Dependency injection

Stryker uses [typed-inject](https://github.com/nicojs/typed-inject#readme) as a [dependency injection (DI) framework](https://medium.com/@jansennico/advanced-typescript-type-safe-dependency-injection-873426e2cc96).

It would help to use this as your DI framework inside the plugin.

Please take a look at this example below. 

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

In this example, you can see that some tokens are loaded from `commonTokens` and some from `pluginTokens`.

* `commonTokens`: These contain the tokens belonging to values Stryker itself provides.
* `pluginTokens`: These are examples of tokens you can provide yourself in your plugin. The `fooTestRunnerFactory` factory method is an example of where the tokens are provided.

DI in this way is type-safe. When you declare your plugin, TypedInject will validate that you don't inject something that does not exist at runtime.

## High-level Stryker workings

This chapter explains how StrykerJS works internally. It might be helpful for plugin creators who want to contribute or plan to create their test runner or checker plugin.

### Step 1: code instrumentation

When you run Stryker on your project, Stryker will first load the files to be mutated. Then, it will mutate those files, placing _all mutations_ into the code simultaneously. But Stryker is smart about it.

This:
```js
function add(a, b) {
  return a + b;
}
```

Becomes (simplified):
```js
function cover(id) {
  if (global.__stryker__.activeTest) {
    global.__stryker__.mutantCoverage.perTest[global.__stryker__.activeTest][id]++;
  }
  else {
    global.__stryker__.mutantCoverage.static.[id]++;
  }
}

function add(a, b) {
  if (global.__stryker__.activeMutant === 0) {
    // 👾
  } else {
    cover(0);
    return global.__stryker__.activeMutant === 1
      ? a - b // 👽
      : (cover(1), a + b);
  }
}
```

Placing all mutants into the source code is called 'mutant schemata' (or mutation switching). All mutants are in the code, but only one can be active simultaneously. Mutant schemata allow for performance optimization like:

1. Compiling only once
2. Running tests multiple times in quick succession without having to reload the test files.

As you can see, we don't rely on Istanbul code coverage. Instead, we instrument the 'mutant coverage' directly into the source file.

### Step 2: dry run

During this step, Stryker tries to run the code without activating any mutations. Tests should pass here. It validates that we didn't break anything and allows us to determine the code coverage per test (also some other things, but that's not important here).

Stryker will instantiate the configured test runner plugin and call its `dryRun` method. During the dry run, it's the test runner's job to hook into the test framework's `beforeEach` hook and switch the `global.__stryker__.activeTest`. Doing so records _mutant coverage per test_. Although this is technically optional (StrykerJS can work when a test runner doesn't report mutation coverage), it dramatically improves performance when supported.

```ts
dryRun(options: DryRunOptions): Promise<DryRunResult> {
}
```

After the test runner performs the dry run, it reports a `DryRunResult` object, which should contain the test results and the 'mutation coverage per test' object. You can find this object on the global scope again: `globalThis.__stryker__.mutantCoverage`.

### Step 3: mutation testing

When the dry run is finished, StrykerJS makes a mutant run plan. This plan specifies precisely the tests to run for each mutant and the timeout value the test runner should use when running it. After those calculations, it is time for the mutation testing step.

During mutation testing, the test runner's `mutantRun` method is called for each mutant:

```ts
mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
}
```

A test runner should:

1. Load the test environment
1. Activate the mutant 
1. Run the filtered tests
1. Report back the mutant result: either `Killed`, `Survived`, or `Timeout`. 

This step is performed in parallel worker processes for speed benefits (depending on the configured `--concurrency`). 

After that, Stryker is done, and an excellent mutation test report gets generated.

#### A note on `capabilities` and `mutantActivation`

Stryker relies on test runners to run mutants in quick succession, each time calling the `mutantRun` method. However, it might occur that Stryker needs to test a [static mutant](../../../mutation-testing-elements/static-mutants/) (when `--ignoreStatic` isn't enabled). In order to solve this: 

This pseudo code should help illustrate what needs to happen

```ts
mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
  if(options.mutantActivation === 'static') {
    global.__stryker__.activeMutant = options.activeMutant.id;
  }
  if(options.reloadEnvironment || this.notLoadedTheEnvironmentYet){
    this.loadTestFiles();
  }
  if(options.mutantActivation === 'runtime'){
    global.__stryker__.activeMutant = options.activeMutant.id;
  }
  return runFilteredTests(options.testFilter);
}
```

As you can see, mutant activation can be either "static" or "runtime".

1. Mutant activation static: the mutant should be active during the loading of the test environment
1. Mutant activation runtime: The mutant MUST NOT be active during the loading of the environment, instead only when actually running the tests.

And then there is also the `reloadEnvironment` boolean.

1. Reload environment `true`: the source- and test files should be reloaded.
1. Reload environment `false`: the source- and test files don't need reloading, you can use them from the previous run.

When your test runner executes tests in the same process ('in bound') and those tests are loaded using ESM modules, then a the test runner is unable to support this 'reloading' of those files. In that case, a test runner can implement the `capabilities` method. This is the way to communicate to Stryker what the capabilities of your test runner are. At the moment of writing, there is only one capability that Stryker needs to know about: whether or not the test runner can "reload the environment".

```ts
capabilities(): {
  return { reloadEnvironment: false };
}
```

## What's next?

If you have a plugin that you think other users might be able to benefit from, or you need some help, please let us know on [Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM). 

We're always looking to promote user-created plugins 💗
