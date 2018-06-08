[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker.svg)](https://www.npmjs.com/package/stryker)
[![Node version](https://img.shields.io/node/v/stryker.svg)](https://img.shields.io/node/v/stryker.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![BCH compliance](https://bettercodehub.com/edge/badge/stryker-mutator/stryker)](https://bettercodehub.com/)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker
*Professor X: For someone who hates mutants... you certainly keep some strange company.*  
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Introduction
For an introduction to mutation testing and Stryker's features, see [stryker-mutator.io](https://stryker-mutator.io/).

## Getting started
Stryker is a mutation testing framework for JavaScript. It allows you to test your tests by temporarily inserting bugs.

To install Stryker, execute the command:
```sh
$ npm install stryker stryker-api --save-dev
```

***Note:*** *During installation you may run into errors caused by [node-gyp](https://github.com/nodejs/node-gyp). It is safe to ignore them.*

To test if Stryker is installed correctly, execute the command:
```sh
$ node_modules/.bin/stryker --version
```

This should print the latest version of Stryker.

## Usage

```sh
$ node_modules/.bin/stryker <command> [options] [stryker.conf.js]
```

The main `command` for Stryker is `run`, which kicks off mutation testing.

By default, we expect a `stryker.conf.js` file in the current working directory. This can be overridden by specifying a different file as the last parameter.

Before your first run, we recommend you try the `init` command, which helps you to set up this `stryker.conf.js` file and install any missing packages needed for your specific configuration. We recommend you verify the contents of the configuration file after this initialization, to make sure everything is setup correctly. Of course, you can still make changes to it, before you run Stryker for the first time.

The following is an example `stryker.conf.js` file:

```javascript
module.exports = function(config){
  config.set({
    mutate: [
      'src/**/*.js',
      '!src/index.js'
    ],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'clear-text', 'dots', 'html', 'event-recorder'],
    coverageAnalysis: 'perTest',
    plugins: ['stryker-mocha-runner', 'stryker-html-reporter']
  });
}
```

As you can see, the config file is *not* a simple JSON file. It should be a node module. You might recognize this way of working from the karma test runner.

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

All configuration options can either be set via the command line or via the `stryker.conf.js` config file.

`files` and `mutate` both support globbing expressions using [node glob](https://github.com/isaacs/node-glob).
This is the same globbing format you might know from [Grunt](https://github.com/gruntjs/grunt) or [Karma](https://github.com/karma-runner/karma).  

You can *ignore* files by adding an exclamation mark (`!`) at the start of an expression.

#### Files to mutate
**Command line:** `[--mutate|-m] src/**/*.js,a.js`
**Config file:** `mutate: ['src/**/*.js', 'a.js']`  
**Default value:** *none*  
**Mandatory**: No  
**Description:**  
With `mutate` you configure the subset of files to use for mutation testing. 
Generally speaking, these should be your own source files.  
This is optional, as you can choose to not mutate any files at all and perform a dry-run (running only your tests without mutating). 

#### Test runner  
**Command line:** `--testRunner karma`  
**Config file:** `testRunner: 'karma'`  
**Default value:** *none*  
**Mandatory**: yes  
**Description:**  
With `testRunner` you specify the test runner to run your tests. This option is required.  
Make sure the test runner plugin for Stryker is installed. E.g. we need the `stryker-karma-runner` to use `karma` as a test runner. 
See the [list of plugins](https://stryker-mutator.io/plugins.html) for an up-to-date list of supported test runners and plugins.

#### Test framework  
**Command line:** `--testFramework jasmine`  
**Config file:** `testFramework: 'jasmine'`  
**Default value:** *none*  
**Mandatory**: No  
**Description:**  
Configure which test framework you are using. 
This option is not mandatory, as Stryker is test framework agnostic (it doesn't care what framework you use), 
However, it is required when `coverageAnalysis` is set to `'perTest'`, because Stryker needs to hook into the test framework in order to measure code coverage results per test and filter tests to run.

Make sure the a plugin is installed for your chosen test framework. E.g. install `stryker-mocha-framework` to use `'mocha'` as a test framework.

#### Type of coverage analysis  
**Full notation:** `--coverageAnalysis perTest`  
**Config file key:** `coverageAnalysis: 'perTest'`  
**Default value:** `perTest`  
**Mandatory**: no  
**Description:**  
With `coverageAnalysis` you specify which coverage analysis strategy you want to use.

Stryker can analyse code coverage results. This can potentially speed up mutation testing a lot, as only the tests covering a 
particular mutation are tested for each mutant. 
This does *not* influence the resulting mutation testing score. It only improves performance, so we enable it by default.

The possible values are: 
* **off**: Stryker will not determine the code covered by tests during the initial test run phase. All tests will be executed for each mutant 
during the mutation testing phase.

* **all**: Stryker will determine the code covered by all tests during the initial test run phase. Only mutants actually covered by your 
test suite are tested during the mutation testing phase. This setting requires your test runner to be able to report the code coverage back to Stryker. 
Currently, only the `stryker-mocha-runner` and the `stryker-karma-runner` do this.  

* **perTest**: Stryker will determine the code covered by your test per executed test during the initial test run phase. Only mutants actually covered by your 
test suite are tested during the mutation testing phase. 
Only the tests that cover a particular mutant are tested for each one. This requires your tests to be able to run independently of each other and in random order. 
In addition to requiring your test runner to be able to report the code coverage back to Stryker, your chosen `testFramework` also needs to support running code
 before and after each test, as well as test filtering.  
 Currently, `stryker-mocha-runner` as well as `stryker-karma-runner` support this. However, `stryker-karma-runner` support is limited to using it with `Jasmine` as the test framework 
 (`Mocha` is not yet supported).

#### Mutator 
**Command line:** `--mutator es5`  
**Config file:** `mutator: { name: 'es5', excludedMutations: ['BooleanSubstitution', 'StringLiteral'] }`  
**Default value:** `es5`  
**Mandatory**: no  
**Description:**  
With `mutator` you configure which mutator plugin you want to use, and optionally, which mutation types to exclude from the test run.  
The mutator plugin name defaults to `es5` if not specified. The list of excluded mutation types defaults to an empty array, meaning all mutation types will be included in the test.  
The full list of mutation types varies slightly between mutators (for example, the `es5` mutator will not use the same mutation types as the `typescript` mutator). Mutation type names are case-sensitive, and can be found either in the source code or in a generated Stryker report.  
 
When using the command line, only the mutator name as a string may be provided.  
When using the config file, you can provide either a string representing the mutator name, or a `MutatorDescriptor` object, like so:  

* `MutatorDescriptor` object: `{ name: 'name', excludedMutations: ['mutationType1', 'mutationType2', ...] }`:  
   * The `name` property is mandatory and contains the name of the mutator plugin to use.  
   * The `excludedMutations` property is mandatory and contains the types of mutations to exclude from the test run.  

#### Transpilers  
**Config file:** `transpilers: '['typescript']'`  
**Default value:** `[ ]`  
**Mandatory**: no  
**Description:**  
With `transpilers` you configure which transpiler plugins should transpile the code before it's executed. This is an array where the transpilers are called in the other of the array. This defaults to an empty array meaning no transpilation will be done.  

#### Reporters  
**Command line:** `--reporter clear-text,progress,dots,dashboard`  
**Config file:** `reporter: ['clear-text', 'progress', 'dots', 'dashboard']`     
**Default value:** `['clear-text', 'progress']`  
**Mandatory**: no  
**Description:**  
With `reporter` you can set a reporter or group of reporters for stryker to use.
These reporters can be used out of the box: `clear-text`, `progress`, `dots`, `dashboard` and `event-recorder`.
By default `clear-text` and `progress` are active if no reporter is configured.
You can load additional plugins to get more reporters. See [stryker-mutator.io](https://stryker-mutator.io)
for an up-to-date list of supported reporter plugins and a description on each reporter.

The `clear-text` reporter supports an additional config option to show more tests that were executed to kill a mutant. The config for your config file is: `clearTextReporter: { maxTestsToLog: 3 },`

The `dashboard` reporter is a special kind of reporter. It sends a report to https://dashboard.stryker-mutator.io, enabling you to add a fancy mutation score badge to your readme! To make sure no unwanted results are sent to the dashboards, it will only send the report if it is run from a build server. The reporter currently detects [Travis](https://travis-ci.org/) and [CircleCI](https://circleci.com/). Please open an [issue](https://github.com/stryker-mutator/stryker/issues/new) if your build server is missing. On all these environments, it will ignore builds of pull requests. Apart from buildserver-specific environment variables, the reporter uses one environment variable:

| Environment variable | Description | Example value |
| ------------- | ------------- | ----- |
| STRYKER\_DASHBOARD\_API\_KEY | Your API key (generated at https://dashboard.stryker-mutator.io) | `52248872-2edc-4102-a43a-bcfca7a9ca99` |

You will need to pass the `STRYKER_DASHBOARD_API_KEY` environment variable yourself. You can create one for your repository by logging in on [the Stryker dashboard](https://dashboard.stryker-mutator.io). We strongly recommend you use encrypted environment variables:
* [Travis documentation](https://docs.travis-ci.com/user/environment-variables/#Encrypting-environment-variables)
* [CircleCI documentation](https://circleci.com/security/#secrets_section)
  
#### Files in the sandbox
**Command line:** `[--files|-f] src/**/*.js,a.js,test/**/*.js`  
**Config file:** `files: ['src/**/*.js', '!src/**/index.js', 'test/**/*.js']`  
**Default value:** result of `git ls-files --others --exclude-standard --cached --exclude .stryker-tmp`  
**Mandatory:** No  
**Description:**  
With `files` you can choose which files should be included in your test runner sandbox. 
This is normally not needed as it defaults to all files not ignored by git. 
Try it out yourself with this command: `git ls-files --others --exclude-standard --cached --exclude .stryker-tmp`.

If you do need to override `files` (for example: when your project does not live in a git repository),
you can override the files here.

When using the command line, the list can only contain a comma separated list of globbing expressions.  
When using the config file you can provide an array with `string`s

You can *ignore* files by adding an exclamation mark (`!`) at the start of an expression.

#### Symlink node modules in the sandbox
**Command line:** *none*  
**Config file:** `symlinkNodeModules: true`  
**Default value:** `true`  
**Mandatory:** No  
**Description:**  
The `symlinkNodeModules` value indicates whether or not Stryker should create a [symbolic link](https://nodejs.org/api/fs.html#fs_fs_symlink_target_path_type_callback) 
to your current node_modules directory in the sandbox directories. This makes running your tests by Stryker behave 
more like your would run the tests yourself in your project directory.
Only disable this setting if you really know what you are doing.

For example, [Jest](https://facebook.github.io/) expects any plugins to be located at "./node_modules/..."
in the Sandbox directory. Another example can be running [karma](http://karma-runner.github.io/) tests where
you specify files from the 'node_modules/angular/...'. Without symlinking the
node_modules directory this would not be possible.

Stryker will look for the node_modules directory to use in the current basePath (or current working directory) and 
its parent directories.

#### Plugins  
**Command line:** `--plugins stryker-html-reporter,stryker-karma-runner`  
**Config file:** `plugins: ['stryker-html-reporter', 'stryker-karma-runner']`  
**Default value:** `['stryker-*']`  
**Mandatory**: no  
**Description:**  
With `plugins` you can add additional Node modules for Stryker to load (or `require`).
By default, all `node_modules` starting with `stryker-` will be loaded, so you would normally not need to specify this option.
These modules should be installed right next to stryker. For a current list of plugins,
you can consult [npm](https://www.npmjs.com/search?q=%40stryker-plugin) or 
[stryker-mutator.io](https://stryker-mutator.io).

#### Start of port range for test runners
**Command line:** `--port 9234`  
**Config file:** `port: 9234`    
**Default value:** `9234`  
**Mandatory**: no  
**Description:**  
With `port` you specify the first port to pass on to the test runner to use. Any additional test runners will be spawned using ports n+1, n+2, etc.
For example, when you set to use port 9234 and Stryker decides to start four test runner processes, ports 9234, 9235, 9236 and 9237 will be passed to the test runner.  
If the test runner decides to use the port it should be available for use.

#### Global timeout in milliseconds  
**Command line:** `--timeoutMs 5000`  
**Config file:** `timeoutMs: 5000`  
**Default value:** `5000`  
**Mandatory**: no  
**Description:**  
When Stryker is mutating code, it cannot determine indefinitely whether or not a code mutation results in an infinite loop (see [Halting problem](https://en.wikipedia.org/wiki/Halting_problem)).
In order to battle infinite loops, a test run gets killed after a certain period of time. This period is configurable with two settings: `timeoutMs` and `timeoutFactor`. 
To calculate the actual timeout in milliseconds the, following formula is used:

```
timeoutForTestRunMs = netTimeMs * timeoutFactor + timeoutMs + overheadMs
``` 

Both `netTimeMs` and `overheadMs` are calculated during the initial test run. They are logged on `info` level. For example when `overheadMs` is 92 and `netTimeMs` is 5: `Initial test run succeeded. Ran 6 tests in 4 seconds (net 5 ms, overhead 92 ms).`

With `timeoutFactor` you can configure the allowed deviation relative to the time of a normal test run. Tweak this if you notice that mutants are prone to creating slower code, but not infinite loops.
`timeoutMs` lets you configure an absolute deviation. Use it, if you run Stryker on a busy machine and you need to wait longer to make sure that the code indeed entered an infinite loop.

#### Timeout factor  
**Command line:** `--timeoutFactor 1.5`  
**Config file:** `timeoutFactor: 1.5`  
**Default value:** `1.5`  
**Mandatory**: no  
**Description:**  
See [Timeout in milliseconds](#Timeout-in-milliseconds).

#### Number of maximum concurrent test runners  
**Command line:** `--maxConcurrentTestRunners 3`  
**Config file:** `maxConcurrentTestRunners: 3`  
**Default value:** number of CPU cores
**Mandatory**: no  
**Description:**  
Specifies the maximum number of concurrent test runners to spawn.  
Mutation testing is time consuming. By default Stryker tries to make the most of your CPU, by spawning as many test runners as you have CPU cores.  
This setting allows you to override this default behavior.

Reasons you might want to lower this setting:

* Your test runner starts a browser (another CPU-intensive process)
* You're running on a shared server and/or
* Your hard disk cannot handle the I/O of all test runners

#### Thresholds for mutation score  
**Config file:** `thresholds: { high: 80, low: 60, break: null }`  
**Default value:** `{ high: 80, low: 60, break: null }`  
**Mandatory**: no  
**Description**  
Specify the thresholds for mutation score. 

* `mutation score >= high`: Awesome! Reporters should color this green and happy.
* `high > mutation score >= low`: Warning! Reporters should color this orange/yellow. Watch yourself!
* `mutation score < low`: Danger! Reporters should color this in red. You're in danger!
* `mutation score < break`: Error! Stryker will exit with exit code 1, indicating a build failure. No consequence for reporters, though.

It is not allowed to only supply one value of the values (it's all or nothing). However, `high` and `low` values can be the same, making sure colors are either red or green. Set `break` to `null` (default) to never let your build fail.

#### Log level  
**Command line:** `--logLevel info`    
**Config file:** `logLevel: 'info'`
**Default value:** `info`  
**Mandatory**: no 
**Description:**  
 Set the `log4js` log level that Stryker uses (default is `info`). Possible values: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `all` and `off`.  
 *Note*: Test runners are run as child processes of the Stryker Node process. All output (stdout) of the `testRunner` is logged as `trace`.  
 Thus, to see logging output from the test runner set the `logLevel` to `all` or `trace`.
