---
title: NodeJS
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/guides/nodejs.md
---

Stryker can run Mutation Testing on all NodeJS projects. Either by using one of the test runner plugins or with the command test runner. It also supports a custom `buildCommand`. This command is useful to compile TypeScript or babel code or to bundle your code.

## About transpiling

There are multiple scenarios of transpiling code when running your tests. 

* **Ahead-of-time**  
  Use `tsc` or [`@babel/cli`](https://babeljs.io/docs/en/babel-cli) to compile your code before testing or use [webpack](https://webpack.js.org/api/cli/) or another bundler to create a bundle before running tests. 
* **Just-in-time**  
  Use [`ts-node`](https://www.npmjs.com/package/ts-node) or [`@babel/register`](https://babeljs.io/docs/en/babel-register/) as a just-in-time compiler to compile your code on the fly.

Both scenarios are supported, however using just-in-time transpiling during mutation testing is not recommended because it means running the compiler a large number of times. Since [Stryker uses mutation switching](https://stryker-mutator.io/blog/announcing-stryker-4-mutation-switching), compiling only once is preferred. Don't worry; this guide will help you configuring Stryker correctly.

If you manage your code's compilation through a `tsconfig.json` file, this guide ensures that your TypeScript code uses that configuration.

> This guide does not cover using `@stryker-mutator/typescript-checker`. Please review the page [here](../typescript-checker.md) if you want to include the typescript checker.

## Configuration

Please follow this configuration guide. Place the configuration examples inside your `stryker.conf.json` file.

### Build command

Example:

```json
{
   "buildCommand": "tsc -b path/to/tsconfig.json"
}
```

> You generally don't have to configure a `buildCommand` if you're using the Jest test runner.

Use the `buildCommand` to configure a command that Stryker can run in its sandbox, just after your code is mutated. If you're using a bundler, you will need to change this command by a command that creates a bundle, like `"webpack --config webpack.test.config.js"`. You can also use a script you've defined in package.json, for example `"npm run build"`. 

Don't worry about your [PATH environment variable](https://en.wikipedia.org/wiki/PATH_(variable)); Stryker will make sure your local dependencies are available there before executing the build command inside the sandbox. 

If you're using `ts-node` or `@babel/register` to just-in-time compile during unit testing, then it's a good idea to configure your build command-equivalent here. Some examples:

* For ts-node: `tsc -b path/to/tsconfig.json`
* For @babel/register: `babel src --out-dir lib`
(using the [@babel/cli](https://babeljs.io/docs/en/babel-cli))

Be sure to test them out yourself first.

### Test runner

Next, configure the test runner you're using. If you're using a different test runner than described here, you can still use the default [command test runner](../configuration.md#testrunner-string)

#### Mocha

Example:

```json
{
  "coverageAnalysis": "perTest",
  "mochaOptions": {
    "config": "path/to/your/.mocharc.js/file",
    "spec": [ "dist/test/**/*.spec.js"]
  },
  "testRunner": "mocha"
}
```

Use the `mochaOptions` to configure the mocha test runner. If your project uses a [mocha config file](https://mochajs.org/#-config-path), you can specify it in `mochaOptions.config`; use other settings to override settings in the config file. 

If you're using a `buildCommand`, be sure to configure the _js output files in the `mochaOptions.spec` instead of the ts input files_, otherwise mocha won't be able to find your test files.

If you choose to keep using your just-in-time compiler and accept the performance penalty, you can use [mochaOptions.require](../mocha-runner.md#mochaoptionsrequire-string) to configure your `ts-node` or `@babel/register` transpiler. Also, you may want to override the ts-node configuration options via environment variables. You can do so using environment variables, for example:

```json
{
  "scripts": {
    "test:mutation": "cross-env TS_NODE_PROJECT=path/to/your/tsconfig.json stryker run"
  }
}
```

> [`cross-env`](https://www.npmjs.com/package/cross-env) is a tool to help you set environment variables across platforms.

#### Jest

Example:

```json
{
  "coverageAnalysis": "perTest",
  "jest": {
    "projectType": "custom",
    "configFile": "path/to/your/custom/jestConfig.js"
   },
  "tempDirName": "stryker-tmp",
  "testRunner": "jest"
}
```

Jest has two ways to provide TypeScript compilation, either [using babel](https://jestjs.io/docs/en/getting-started#using-typescript) (default) or using [ts-jest](https://www.npmjs.com/package/ts-jest). For both, you _don't need to configure the `buildCommand`_. 

## Run

Run Stryker as per usual, either using a custom script in package.json or using `npx`.

```shell
npx stryker run
# OR, if your script is called "test:mutation"
npm run test:mutation 
```

#### Jasmine

Example:

```json
{
  "coverageAnalysis": "perTest",
  "jasmineConfigFile": "spec/support/jasmine.json",
  "testRunner": "jasmine"
}
```

## Troubleshooting FAQ

### Build command fails

If you're running into issues with your `buildCommand`, try to execute it by hand to make sure it works. For example, if your `buildCommand` is `"tsc -b path/to/tsconfig.json"`, try to run `npx tsc  -b path/to/tsconfig.json` yourself, did it have the desired effect?

If that works, the next step would be to try the command yourself _inside the Stryker sandbox directory_. Please `cd` into the `.stryker-tmp/sandbox-xxxxx` directory and try the command there. For example:

```shell
cd .stryker-tmp/sandbox-12345678
node ../../node_modules/typescript/bin/tsc -b path/to/tsconfig.json
```

> Note: since the sandbox dir doesn't have you node_modules, you will need to specify the full path to the TypeScript compiler.

### Initial test run fails 

You might run into issues like this:

> One or more tests resulted in an error
> [...] Cannot assign to 'stryNS_9fa48' because it is not a variable [...]

The initial test run might fail when you're using ts-jest or ts-node. The reason for this is that Stryker will mutate your code and, by doing so, introduce type errors into your code. Stryker tries to ignore these errors by adding [`// @ts-nocheck`](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/#ts-nocheck-in-typescript-files) in your source files. However, this is only done for TypeScript-like files inside your `lib`, `src`, and `test` directories by default. If you have your code somewhere else, you will need to override [disableTypeChecks](../configuration.md#disabletypechecks-false--string) yourself:

```json
{
  "disableTypeChecks": "app/**/*.{js,ts,jsx,tsx,html,vue}"
}
```

### No tests executed - jest runner
You might run into issues like this when using the `@stryker-mutator/jest-runner`:

> No tests found, exiting with code 1
> Run with `--passWithNoTests` to exit with code 0

You will need to override the `tempDirName` to a directory without a `.` in front of it.

```json
{
   "tempDirName": "stryker-tmp"
}
```

See [#1691](https://github.com/stryker-mutator/stryker-js/issues/1691) for more info.