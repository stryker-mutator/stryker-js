---
title: TypeScript NodeJS
custom_edit_url: https://github.com/stryker-mutator/stryker/edit/master/docs/guides/typescript-nodejs.md
---

Stryker supports all NodeJS projects. Either by using one of the test runner plugins or with the command test runner.

## About TypeScript compilation

There are multiple ways of compiling TypeScript code. 

* Using `tsc` or `babel` to compile your code before testing; 
* Using [`ts-node`](https://www.npmjs.com/package/ts-node) or [`@babel/register`](https://babeljs.io/docs/en/babel-register/) as a just-in-time compiler (the test runner compiles your code just in time);
* Using webpack or some other bundler to create a bundle before running tests. 

All of these scenarios are supported, however using a just-in-time compiler during mutation testing is not recommended because it means running the compiler a large number of times. Since [Stryker uses mutation switching](https://stryker-mutator.io/blog/announcing-stryker-4-mutation-switching), compiling only once is preferred. Don't worry; this guide will help you configuring Stryker correctly.

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

Use the `buildCommand` to configure a command that Stryker can run in its sandbox, just after it mutated your code. If you're using a bundler, you might need to change this command by a command that creates a bundle, like `"webpack --config webpack.test.config.js"`. You can also use a script you've defined in package.json, for example `"npm run build"`. 

Don't worry about your [PATH environment variable](https://en.wikipedia.org/wiki/PATH_(variable)); Stryker will make sure your local dependencies are available there before executing the build command inside the sandbox. 

If you're using `ts-node` or `@babel/register` to just-in-time compile during unit testing, then it's a good idea to configure your build command-equivalent here. Some examples:

* For ts-node: `tsc -b path/to/tsconfig.json`
* For @babel/register: `babel src --out-dir lib`
(using the [@babel/cli](https://babeljs.io/docs/en/babel-cli))

### Test runner

Next, configure the test runner you're using. Here are 2 examples, one for jest and one for Mocha. If you're using [jasmine](../jasmine-runner.md) or [karma](../karma-runner.md), please see their respective pages. If you're using a different test runner, you can still use the default [command test runner](../configuration.md#testrunner-string)

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

If you're using a `buildCommand`, be sure to configure the _js output files in the `mochaOptions.spec` instead of the ts input files_, otherwise Mocha won't be able to find your test files.

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
  "testRunner": "jest"
}
```

Jest has two ways to provide TypeScript compilation, either [using babel](https://jestjs.io/docs/en/getting-started#using-typescript) (default) or using [ts-jest](https://www.npmjs.com/package/ts-jest). For both, you _don't need to configure the `buildCommand`_. 

### Run

Run Stryker as per usual, either using a custom script in package.json or using `npx`.

```shell
npx stryker run
# OR
npm run test:mutation 
# if your script is called "test:mutation"
```
