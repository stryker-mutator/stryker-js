---
title: Plugins
custom_edit_url: https://github.com/stryker-mutator/stryker4s/edit/master/docs/api/plugins.md
---

You can extend Stryker with 6 plugin kinds:

```ts
export enum PluginKind {
  ConfigEditor = 'ConfigEditor',
  TestRunner = 'TestRunner',
  TestFramework = 'TestFramework',
  Transpiler = 'Transpiler',
  Mutator = 'Mutator',
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
import { Transpiler } from '@stryker-mutator/api/transpile';
import { File, StrykerOptions } from '@stryker-mutator/api/core';

class FooTranspiler implements Transpiler {
  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    // TODO: implement
  }
}
```

In this example, a Transpiler plugin is constructed. Each plugin kind has it's own interface, so it's easy to create.

After that, you're ready to declare your plugin.

## Declaring your plugin

You can either declare it as a factory method or a class.

A class example:

```ts
import HtmlReporter from './HtmlReporter';
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [declareClassPlugin(PluginKind.Reporter, 'html', HtmlReporter)];
```

A factory method example:

```ts
import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import { babelTranspilerFactory } from './BabelTranspiler';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Transpiler, 'babel', babelTranspilerFactory)];
```

## Dependency injection

Stryker uses [typed-inject](https://github.com/nicojs/typed-inject#readme) as a [dependency injection framework](https://medium.com/@jansennico/advanced-typescript-type-safe-dependency-injection-873426e2cc96).
You can use it as well in your plugin.

See this example below. Here, a `Logger`, `StrykerOptions` and the `produceSourceMaps` boolean is injected.

```ts
import { Transpiler } from '@stryker-mutator/api/transpile';
import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

class PassThroughTranspiler implements Transpiler {
  public static inject = tokens(commonTokens.options, commonTokens.produceSourceMaps);
  public constructor(private log: Logger, options: StrykerOptions, produceSourceMaps: boolean) {

  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    this.log.info('called with %s', files);
    return files;
  }
}
```

This is type-safe. When you declare your plugin, TypedInject will validate that you don't inject something that cannot be resolved at runtime.

## What's next?

If you need some help, please let us know on [Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM).
