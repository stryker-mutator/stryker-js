[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Dcore)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=core)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/core.svg)](https://www.npmjs.com/package/@stryker-mutator/core)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/core.svg)](https://img.shields.io/node/v/@stryker-mutator/core.svg)
[![Slack Chat](https://img.shields.io/badge/slack-chat-brightgreen.svg?logo=slack)](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker
*Professor X: For someone who hates mutants... you certainly keep some strange company.*
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Introduction
For an introduction to mutation testing and Stryker's features, see [stryker-mutator.io](https://stryker-mutator.io/).

## Getting started

Please follow the [quickstart on the website](https://stryker-mutator.io/stryker/quickstart).

For small js projects, you can try the following command:

```
npm install --save-dev @stryker-mutator/core
# Only for small projects:
npx stryker run
```

It will run stryker with default values:

* Uses `npm test` as your test command
* Searches for files to mutate in the `lib` and `src` directories

## Usage

```sh
$ npx stryker <command> [options] [configFile]
```

The main `command` for Stryker is `run`, which kicks off mutation testing.

Although Stryker can run without any configuration, it is recommended to configure it when you can, as it can greatly improve performance of the mutation testing process. By default, Stryker will look for a `stryker.conf.js` or `stryker.conf.json` file in the current working directory (if it exists). This can be overridden by specifying a different file as the last parameter.

Before your first run, we recommend you try the `init` command, which helps you to set up this config file and install any missing packages needed for your specific configuration. We recommend you verify the contents of the configuration file after this initialization, to make sure everything is setup correctly. Of course, you can still make changes to it, before you run Stryker for the first time.

The following is an example `stryker.conf.json` file. It specifies running mocha tests with the mocha test runner.

```json
{
  "$schema": "https://raw.githubusercontent.com/stryker-mutator/stryker/master/packages/api/schema/stryker-core.json",
  "mutate": [
    "src/**/*.js",
    "!src/index.js"
  ],
  "testRunner": "mocha",
  "reporters": ["progress", "clear-text", "html"],
  "coverageAnalysis": "perTest"
}
```

As a `stryker.conf.js` file this looks like this:
```javascript
/**
* @type {import('@stryker-mutator/api/core').StrykerOptions}
*/
module.exports = {
  mutate: [
    'src/**/*.js',
    '!src/index.js'
  ],
  testRunner: 'mocha',
  reporters: ['progress', 'clear-text', 'html'],
  coverageAnalysis: 'perTest'
};
```

Make sure you *at least* specify the `testRunner` options when mixing the config file and/or command line options.

## Command-line interface
Stryker can also be installed, configured and run using the [Stryker-CLI](https://github.com/stryker-mutator/stryker-cli). If you plan on using Stryker in more projects, the Stryker-CLI is the easiest way to install, configure and run Stryker for your project.

You can install the Stryker-CLI using:

```bash
$ npm install -g stryker-cli
```

The Stryker-CLI works by passing received commands to your local Stryker installation. If you don't have Stryker installed yet, the Stryker-CLI will help you with your Stryker installation. This method allows us to provide additional commands with updates of Stryker itself.

## Supported mutators

See our website for the [list of currently supported mutators](https://stryker-mutator.io/mutators.html).

## Configuration

All configuration options can either be set via the command line or via a config file.

`files` and `mutate` both support globbing expressions using [node glob](https://github.com/isaacs/node-glob).
This is the same globbing format you might know from [Grunt](https://github.com/gruntjs/grunt) or [Karma](https://github.com/karma-runner/karma).

You can *ignore* files by adding an exclamation mark (`!`) at the start of an expression.

### Available Options
* [allowConsoleColors](#allowConsoleColors)
* [buildCommand](#buildCommand)
* [cleanTempDir](#cleanTempDir)
* [concurrency](#concurrency)
* [commandRunner](#commandRunner)
* [coverageAnalysis](#coverageAnalysis)
* [dashboard.*](#dashboard)
* [fileLogLevel](#fileLogLevel)
* [files](#files-string)
* [logLevel](#logLevel)
* [maxConcurrentTestRunners](#maxConcurrentTestRunners)
* [mutate](#mutate)
* [mutator](#mutator)
* [plugins](#plugins)
* [reporters](#reporters)
* [sandbox.fileHeaders](#sandbox.fileHeaders)
* [sandbox.stripComments](#sandbox.stripComments)
* [symlinkNodeModules](#symlinkNodeModules)
* [tempDirName](#tempDirName)
* [testRunner](#testRunner)
* [thresholds](#thresholds)
* [timeoutFactor](#timeoutFactor)
* [timeoutMS](#timeoutMS)

<a name="allowConsoleColors"></a>
### `allowConsoleColors` [`boolean`]

Default: `true`
Command line: `--allowConsoleColors true`
Config file: `allowConsoleColors: true`

The `allowConsoleColors` value indicates whether Stryker should use colors in console.

<a name="buildCommand"></a>
### `buildCommand` [`string`]

Default: `undefined`  
Command line: `[-b|--buildCommand] "npm run build"`  
Config file: `buildCommand: 'npm run build'`  

Configure a build command to run after mutating the code, but before mutants are tested. This is generally used to transpile your code before testing.
Only configure this if your test runner doesn't take care of this already and you're not using just-in-time transpiler like `babel/register` or `ts-node`.

<a name="cleanTempDir"></a>
### `cleanTempDir` [`boolean`]

Default: `true`  
Command line: `--cleanTempDir false`  
Config file: `cleanTempDir: false`  

Choose whether or not to clean the temp dir (which is ".stryker-tmp" inside the current working directory by default) after a successful run. 
The temp dir will never be removed when the run failed for some reason (for debugging purposes).

<a name="concurrency"></a>
### `concurrency` [`number`]

Default: `cpuCoreCount <= 4? cpuCoreCount : cpuCoreCount - 1`  
Command line: `--concurrency 4`  
Config file: `concurrency: 4`  

Set the concurrency of workers. Stryker will always run checkers and test runners in parallel by creating worker processes (note, not `worker_threads`). This defaults to `n-1` where `n` is the number of logical CPU cores available on your machine, unless `n <= 4`, in that case it uses `n`. This is a sane default for most use cases.

<a name="commandRunner"></a>
### `commandRunner` [`object`]

Default: `{ command: 'npm test' }`
Command line: *none*
Config file: `commandRunner: { command: 'npm run mocha' }`

With `commandRunner`, you can specify the command to execute for running tests.

<a name="coverageAnalysis"></a>
### `coverageAnalysis` [`string`]

Default: `off`
Command line: `--coverageAnalysis perTest`
Config file: `coverageAnalysis: 'perTest'`

With `coverageAnalysis` you specify which coverage analysis strategy you want to use.

Stryker can analyse code coverage results. This can potentially speed up mutation testing a lot, as only the tests covering a
particular mutation are tested for each mutant.
This does *not* influence the resulting mutation testing score. It only improves performance.

The possible values are:

* **off**: Stryker will not determine the code covered by tests during the initial test run phase. All tests will be executed for each mutant
during the mutation testing phase.

* **all**: Stryker will determine the code covered by all tests during the initial test run phase. Only mutants actually covered by your
test suite are tested during the mutation testing phase. This setting requires your test runner to be able to report the code coverage back to Stryker.
Currently, only the `stryker-mocha-runner` and the `stryker-karma-runner` do this.

* **perTest**: Stryker will determine the code covered by your test per executed test during the initial test run phase. Only mutants actually covered by your
test suite are tested during the mutation testing phase.
Only the tests that cover a particular mutant are tested for each one. This requires your tests to be able to run independently of each other and in random order.
 before and after each test, as well as test filtering.
 Currently all test runner plugins, except for `@stryker-mutator/jest-runner`) support this feature.

<a name="dashboard"></a>
### `dashboard` [`DashboardOptions`]

Default: `{ baseUrl: 'https://dashboard.stryker-mutator.io/api/reports', reportType: 'mutationScore' }`
Command line: `--dashboard.project github.com/my-org/my-project --dashboard.version branch-or-tag --dashboard.module my-module --dashboard.baseUrl https://dashboard.stryker-mutator.io/api/reports --dashboard.reportType full`
Config file: `{ project: 'github.com/my-org/my-project', version: 'branch-or-tag', module: 'my-module', baseUrl: 'https://dashboard.stryker-mutator.io/api/reports', reportType: 'full' }`

Settings for the `dashboard` [reporter](#reporters). See the [stryker handbook for more info](https://github.com/stryker-mutator/stryker-handbook/blob/master/dashboard.md)

<a name="fileLogLevel"></a>
### `fileLogLevel` [`string`]

Default: `off`
Command line: `--fileLogLevel info`
Config file: `fileLogLevel: 'info'`

Set the log level that Stryker uses to write to the "stryker.log" file. Possible values: `off`, `fatal`, `error`, `warn`, `info`, `debug` and `trace`

<a name="files-string"></a>
### `files` [`string[]`]

Default: result of `git ls-files --others --exclude-standard --cached --exclude .stryker-tmp`
Command line: `[--files|-f] src/**/*.js,a.js,test/**/*.js`
Config file: `files: ['src/**/*.js', '!src/**/index.js', 'test/**/*.js']`

With `files`, you can choose which files should be included in your test runner sandbox.
This is normally not needed as it defaults to all files not ignored by git.
Try it out yourself with this command: `git ls-files --others --exclude-standard --cached --exclude .stryker-tmp`.

If you do need to override `files` (for example: when your project does not live in a git repository),
you can override the files here.

When using the command line, the list can only contain a comma separated list of globbing expressions.
When using the config file you can provide an array with `string`s

You can *ignore* files by adding an exclamation mark (`!`) at the start of an expression.

<a name="logLevel"></a>
### `logLevel` [`string`]

Default: `info`
Command line: `--logLevel info`
Config file: `logLevel: 'info'`


 Set the log level that Stryker uses to write to the console. Possible values: `off`, `fatal`, `error`, `warn`, `info`, `debug` and `trace`

 *Note*: Test runners are run as child processes of the Stryker Node process. All output (stdout) of the `testRunner` is logged as `trace`.
 Thus, to see logging output from the test runner set the `logLevel` to `all` or `trace`.

<a name="maxConcurrentTestRunners"></a>
### DEPRECATED `maxConcurrentTestRunners` [`number`] 

Default: (see [concurrency](#concurrency))
Command line: `--maxConcurrentTestRunners 3`
Config file: `maxConcurrentTestRunners: 3`

DEPRECATED. Please use [concurrency](#concurrency) instead. 

<a name="mutate"></a>
### `mutate` [`string[]`]

Default: `['{src,lib}/**/*.js?(x)', '!{src,lib}/**/__tests__/**/*.js?(x)', '!{src,lib}/**/?(*.)+(spec|test).js?(x)', '!{src,lib}/**/*+(Spec|Test).js?(x)']`
Command line: `[--mutate|-m] src/**/*.js,a.js`
Config file: `mutate: ['src/**/*.js', 'a.js']`

With `mutate` you configure the subset of files to use for mutation testing.
Generally speaking, these should be your own source files.
This is optional, as you can choose to not mutate any files at all and perform a dry-run (running only your tests without mutating).

<a name="mutator"></a>
### `mutator` [`MutatorDescriptor`]

Default: `{}`
Command line: *none*
Config file:  ``mutator: { plugins: ['classProperties', 'optionalChaining'], excludedMutations: ['BooleanSubstitution', 'StringLiteral'] }`

* `plugins`: allows you to override the default [babel plugins](https://babeljs.io/docs/en/plugins) to use for JavaScript files.
By default, Stryker uses [a default list of babel plugins to parse your JS file](https://github.com/stryker-mutator/stryker/blob/master/packages/instrumenter/src/parsers/js-parser.ts#L8-L32). It also loads any plugins or presets you might have configured yourself with `.babelrc` or `babel.config.js` files.
In the rare situation where the plugins Stryker loads conflict with your own local plugins (for example, when using the decorators and decorators-legacy plugins together), you can override the `plugins` here to `[]`.
* `excludedMutations`: allow you to specify a [list of mutator names](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutator-types.md#supported-mutators) to be excluded (`ignored`) from the test run.

_Note: prior to Stryker version 4, the mutator also needed a `name` (or be defined as `string`). This is removed in version 4. Stryker now supports mutating of JavaScript and friend files out of the box, without the need of a mutator plugin._

<a name="plugins"></a>
### `plugins` [`string[]`]

Default: `['@stryker-mutator/*']`
Command line: `--plugins @stryker-mutator/jasmine-framework,@stryker-mutator/karma-runner`
Config file: `plugins: ['@stryker-mutator/jasmine-framework', '@stryker-mutator/karma-runner']`


With `plugins`, you can add additional Node modules for Stryker to load (or `require`).
By default, all `node_modules` starting with `@stryker-mutator/*` will be loaded, so you would normally not need to specify this option.
These modules should be installed right next to stryker. For a current list of plugins,
you can consult [npm](https://www.npmjs.com/search?q=stryker-plugin) or
[stryker-mutator.io](https://stryker-mutator.io).

<a name="reporters"></a>
### `reporters` [`string[]`]

Default: `['clear-text', 'progress', 'html']`
Command line: `--reporters clear-text,progress,dots,dashboard,html`
Config file: `reporters: ['clear-text', 'progress', 'dots', 'dashboard', 'html']`

With `reporters`, you can set the reporters for stryker to use.
These reporters can be used out of the box: `html`, `progress`, `clear-text`, `dots`, `dashboard` and `event-recorder`.
By default, `clear-text`, `progress`, `html` are active if no reporters are configured.
You can load additional plugins to get more reporters. See [stryker-mutator.io](https://stryker-mutator.io)
for an up-to-date list of supported reporter plugins and a description on each reporter.

The `html` reporter allows you to specify an output folder. This defaults to `reports/mutation/html`. The config for your config file is: `htmlReporter: { baseDir: 'mypath/reports/stryker' }`

The `clear-text` reporter supports three additional config options:
* `allowColor` to use cyan and yellow in printing source file names and positions. This defaults to `true`, so specify as `clearTextReporter: { allowColor: false },` to disable if you must.
* `logTests` to log the names of unit tests that were run to allow mutants. By default, only the first three are logged. The config for your config file is: `clearTextReporter: { logTests: true },`
* `maxTestsToLog` to show more tests that were executed to kill a mutant when `logTests` is true. The config for your config file is: `clearTextReporter: { logTests: true, maxTestsToLog: 7 },`

The `dashboard` reporter sends a report to https://dashboard.stryker-mutator.io, enabling you to add a mutation score badge to your readme, as well as hosting your html report on the dashboard. It uses the [dashboard.*](#dashboard) configuration options. See [the Stryker handbook](https://github.com/stryker-mutator/stryker-handbook/blob/master/dashboard.md) for more info.

<a name="sandbox.fileHeaders"></a>
### `sandbox.fileHeaders` [`object`]

Default: `{ "**/*+(.js|.ts|.cjs|.mjs)?(x)": "/* eslint-disable */\n// @ts-nocheck\n" }`
Command line: *none*
Config file: `sandbox: { fileHeaders: {} }`

Configure additional headers to be added to files inside your sandbox. These headers will be added after Stryker has instrumented your code with mutants, but before a test runner or build command is executed. This is be used to ignore typescript compile errors and eslint warnings that might have been added in the process of instrumenting your code. 

The key here is a [glob expression](https://globster.xyz/), where the value points to the header to be used for matching files.

*Note: The default setting should work for most use cases, only change this if you know what you are doing.*

<a name="sandbox.stripComments"></a>
### `sandbox.stripComments` [`false` | `string`]

Default: `"**/*+(.js|.ts|.cjs|.mjs)?(x)"`
Command line: *none*
Config file: `sandbox: { stripComments: "" }`

Configure files to be stripped of comments (either single line with `//` or multi line with `/**/`. These comments will be stripped after Stryker has instrumented your code with mutants, but before a test runner or build command is executed. This is used to remove any lingering `// @ts-check` or `// @ts-expect-error` comments that interfere with typescript compilation. The default setting allows comments to be stripped from all JavaScript and friend files in your sandbox, you can specify a different [glob expression](https://globster.xyz/) or set it to `false` to completely disable this behavior.

*Note: The default setting should work for most use cases, only change this if you know what you are doing.*

<a name="symlinkNodeModules"></a>
### `symlinkNodeModules` [`boolean`]

Default: `true`
Command line: *none*
Config file: `symlinkNodeModules: true`

The `symlinkNodeModules` value indicates whether Stryker should create a [symbolic link](https://nodejs.org/api/fs.html#fs_fs_symlink_target_path_type_callback)
to your current node_modules directory in the sandbox directories. This makes running your tests by Stryker behave
more like your would run the tests yourself in your project directory.
Only disable this setting if you really know what you are doing.

For example, [Jest](https://jestjs.io/) expects any plugins to be located at "./node_modules/..."
in the Sandbox directory. Another example can be running [karma](http://karma-runner.github.io/) tests where
you specify files from the 'node_modules/angular/...'. Without symlinking the
node_modules directory this would not be possible.

Stryker will look for the node_modules directory to use in the current basePath (or current working directory) and
its parent directories.

<a name="tempDirName"></a>
### `tempDirName` [`string`]

Default: `'.stryker-tmp'`
Command line: `--tempDirName .stryker-tmp`
Config file: `tempDirName: '.stryker-tmp'`

Choose a different temp dir that Stryker uses for mutation testing. This directory will contain copies of your source code during a mutation test run.
It will be created if it not exists and is **entirely deleted** after a successful run, so change this with caution.

It is advised to use a directory inside the directory that holds your repository. This way `node_modules` are resolved as expected. Be sure to
not check-in your chosen temp directory in your `.gitignore` file.

<a name="testFramework"></a>

_Note: Use of "testFramework" is no longer needed. You can remove it from your configuration. Your test runner plugin now handles its own test framework integration_

<a name="testRunner"></a>
### `testRunner` [`string`]

Default: `'command'`
Command line: `--testRunner karma`
Config file: `testRunner: 'karma'`

With `testRunner` you specify the test runner that Stryker uses to run your tests. The default value is `command`. The command runner runs a configurable bash/cmd command and bases the result on the exit code of that program (0 for success, otherwise failed). You can configure this command via the config file using the `commandRunner: { command: 'npm run mocha' }`. It uses `npm test` as the command by default.

The command test runner can be made to work in any use case, but comes with a performance
penalty, as Stryker cannot do any optimizations and just runs all tests for all mutants.
If possible, you should try to use one of the test runner plugins that hook into your test runner of choice.
For example: install and use the `stryker-karma-runner` to use `karma` as a test runner.
See the [list of plugins](https://stryker-mutator.io/plugins.html) for an up-to-date list of supported test runners and plugins.

<a name="thresholds"></a>
### `thresholds` [`object`]

Default: `{ high: 80, low: 60, break: null }`
Command line: *none*
Config file: `thresholds: { high: 80, low: 60, break: null }`

Description
Specify the thresholds for mutation score.

* `mutation score >= high`: Awesome! Reporters should color this green and happy.
* `high > mutation score >= low`: Warning! Reporters should color this orange/yellow. Watch yourself!
* `mutation score < low`: Danger! Reporters should color this in red. You're in danger!
* `mutation score < break`: Error! Stryker will exit with exit code 1, indicating a build failure. No consequence for reporters, though.

It is not allowed to only supply one value of the values (it's all or nothing). However, `high` and `low` values can be the same, making sure colors are either red or green. Set `break` to `null` (default) to never let your build fail.

<a name="timeoutFactor"></a>
### `timeoutFactor` [`number`]

Default: `1.5`
Command line: `--timeoutFactor 1.5`
Config file: `timeoutFactor: 1.5`

See [Timeout in milliseconds](#timeoutMS).

<a name="timeoutMS"></a>
### `timeoutMS` [`number`]

Default: `5000`
Command line: `--timeoutMS 5000`
Config file: `timeoutMS: 5000`


When Stryker is mutating code, it cannot determine indefinitely whether a code mutation results in an infinite loop (see [Halting problem](https://en.wikipedia.org/wiki/Halting_problem)).
In order to battle infinite loops, a test run gets killed after a certain period of time. This period is configurable with two settings: `timeoutMS` and `timeoutFactor`.
To calculate the actual timeout in milliseconds the, following formula is used:

```
timeoutForTestRunMs = netTimeMs * timeoutFactor + timeoutMS + overheadMs
```

Both `netTimeMs` and `overheadMs` are calculated during the initial test run. They are logged on `info` level. For example when `overheadMs` is 92 and `netTimeMs` is 5: `Initial test run succeeded. Ran 6 tests in 4 seconds (net 5 ms, overhead 92 ms).`

With `timeoutFactor` you can configure the allowed deviation relative to the time of a normal test run. Tweak this if you notice that mutants are prone to creating slower code, but not infinite loops.
`timeoutMS` lets you configure an absolute deviation. Use it, if you run Stryker on a busy machine and you need to wait longer to make sure that the code indeed entered an infinite loop.

<a name="transpilers"></a>

_Note: Support for "transpilers" plugins is removed since Stryker 4. You can now configure your own [buildCommand](#buildCommand)_

## Programmatic use

Stryker can also be used programmatically from nodejs. It exports 2 classes for you to use: `Stryker` and `StrykerCli`.

```ts
import { Stryker, StrykerCli } from '@stryker-mutator/core';
```

Both classes can be used to run Stryker. The main difference is that `Stryker` is a slightly more low-level approach, while `StrykerCli` is the strait up CLI api.

In this example you can see how to use both. 

```ts
async function main() {
  // Runs Stryker as if it was called directly from the cli. Not even returns a promise, it assumes to be allowed to call `process.exit`.
  new StrykerCli(process.argv /* RAW argv array */ ).run(); 

  // Runs Stryker, will not assume to be allowed to exit the process.
  const stryker = new Stryker({ concurrency: 4 } /* Partial Stryker options object */ );
  const mutantResults = await stryker.runMutationTest();
  // mutantResults or rejected with an error.
}
```

Stryker is written in TypeScript, so it is recommended to use Stryker as well to get the best developer experience.