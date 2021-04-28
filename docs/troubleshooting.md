---
title: Troubleshooting
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/troubleshooting.md
---

Below you'll find an ever-growing list of issues that you might occur when running StrykerJS on your project for the first time.

### Build command fails

Example:

> ```
>  ERROR Stryker Unexpected error occurred while running Stryker Error: Command failed with exit code 1:
>  my-build-command
> ```

If you're running into issues with your `buildCommand`, try to execute it by hand to make sure it works. For example, if your `buildCommand` is `"tsc -b path/to/tsconfig.json"`, try to run `npx tsc  -b path/to/tsconfig.json` yourself, did it have the desired effect?

If that works, the next step would be to try the command yourself _inside the Stryker sandbox directory_. Please `cd` into the `.stryker-tmp/sandbox-xxxxx` directory and try the command there. For example:

```shell
cd .stryker-tmp/sandbox-12345678
node ../../node_modules/typescript/bin/tsc -b path/to/tsconfig.json
```

**Note**: since the sandbox dir doesn't have you node_modules, you will need to specify the full path to the TypeScript compiler.

### Initial test run fails 

Example:

> ```
> One or more tests resulted in an error
> [...] Cannot assign to 'stryNS_9fa48' because it is not a variable [...]
> ```

The initial test run might fail when you're using ts-jest or ts-node. The reason for this is that Stryker will mutate your code and, by doing so, introduce type errors into your code. Stryker tries to ignore these errors by adding [`// @ts-nocheck`](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/#ts-nocheck-in-typescript-files) in your source files. However, this is only done for TypeScript-like files inside your `lib`, `src`, and `test` directories by default. If you have your code somewhere else, you will need to override [disableTypeChecks](./configuration.md#disabletypechecks-false--string) yourself:

```json
{
  "disableTypeChecks": "app/**/*.{js,ts,jsx,tsx,html,vue}"
}
```

Another cause might be that you're using TypeScript v3.7 or lower. In that case, you should update TypeScript to at least v3.7 or higher. Alternatively you can try to switch to another transpiler, like [babel](https://babeljs.io/docs/en/babel-preset-typescript), but, honestly, updating TypeScript should be the first solution.

### No tests executed - Jest runner

You might run into issues like this when using the `@stryker-mutator/jest-runner`:

> ```
> No tests found, exiting with code 1
> Run with `--passWithNoTests` to exit with code 0
> ```

You will need to override the `tempDirName` to a directory without a `.` in front of it.

```json
{
   "tempDirName": "stryker-tmp"
}
```

See [#1691](https://github.com/stryker-mutator/stryker-js/issues/1691) for more info.

### All mutants survive - Jest runner

When running with the `@stryker-mutator/jest-runner` on windows you might run into the issue where all mutants survive unexpectedly:

> ```
> [...]
> #3. [Survived] ArithmeticOperator
> C:\z\github\stryker-mutator\stryker-js\e2e\test\jest-node\src\sum.js:5:10
> -     return a - b;
> +     return a + b;
> Ran all tests for this mutant.
> 
> Ran 0.00 tests per mutant on average.
> ----------|---------|----------|-----------|------------|----------|---------|
> File      | % score | # killed | # timeout | # survived | # no cov | # error |
> ----------|---------|----------|-----------|------------|----------|---------|
> All files |    0.00 |        0 |         0 |          4 |        0 |       0 |
>  sum.js   |    0.00 |        0 |         0 |          4 |        0 |       0 |
> ----------|---------|----------|-----------|------------|----------|---------|
> ```

The root cause for this is that Jest doesn't support running in a hidden directory on windows, like StrykerJS does by default (the sandbox directory is located in `.stryker-tmp`, a hidden directory). See [issue 9728](https://github.com/facebook/jest/issues/9728) for more info.

Known workarounds:

1. Change the [`tempDirName`](./configuration.md#tempdirname-string) to a non-hidden directory, for example `--tempDirName stryker-tmp`.
2. You can also choose to run Stryker in place, using [`--inPlace`](./configuration.md#inplace-boolean)


### Jest crashes with a multi project configuration

Example:

> ```
>  ERROR DryRunExecutor One or more tests resulted in an error:
>         Test runner crashed. Tried twice to restart it without any luck. Last time the error message was:
> Error: Jest: Cannot use configuration as an object without a file path.
>     at readConfig (C:\z\github\jest-issue\node_modules\jest-config\build\index.js:188:13)
> ```

This can happen when you have multiple [`"projects"`](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig) defined in your Jest configuration. Currently, the jest-runner uses the `runCli` of Jest, which doesn't support this. However, [the PR that adds support for this just merged](https://github.com/facebook/jest/pull/11307), so future releases of Jest should work. 

Until then, the only known workaround is to configure Jest without using "projects" 🤷‍♂️.