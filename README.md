[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker.svg)](https://www.npmjs.com/package/stryker)
[![Node version](https://img.shields.io/node/v/stryker.svg)](https://img.shields.io/node/v/stryker.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](stryker-80x80.png)
# Stryker

*Professor X: For someone who hates mutants... you certainly keep some strange company.*  
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Getting started
Stryker is a mutation testing framework for JavaScript. It allows you to test your test by temporarily inserting bugs.

To install stryker, execute the command:
```
npm install stryker stryker-api --save-dev
```
***Note****: During the installation you may run into errors caused by [node-gyp](https://github.com/nodejs/node-gyp). It is safe to ignore these errors.*

To test if stryker is working, execute the command:
```
node_modules/.bin/stryker --version
```

## Usage

```bash
node_modules/.bin/stryker <command> [options] [stryker.conf.js]
```

The only command supported at the moment is `run`. The last argument is the location to the stryker config file. This is optional, you can also command line options instead. 
If both the config file and options are combined, the command line options will overrule the options in the config file.

An example stryker.conf.js file:

```javascript
module.exports = function(config){
  config.set({
    files: ['test/helpers/**/*.js', 'test/unit/**/*.js', { pattern: 'src/**/*.js', included: false, mutated: true }],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'clear-text', 'html', 'event-recorder'],
    coverageAnalysis: 'perTest',
    plugins: ['stryker-mocha-runner', 'stryker-html-reporter']
  });
}
``` 

As you can see, the config file is *not* a simple json file, it should be a common js (a.k.a. npm) module.
You might recognize this way of working from the karma test runner.
 
Between the config file and your command line options, you should *at least* specify `files` (or `-f`) and the `testRunner` options.  

## Supported mutators
The mutators that are supported by Stryker can be found on [our website](http://stryker-mutator.github.io/mutators.html)

## Configuration
All options can be configured either via the command line or via a config file.

Both `files` and `mutate` support globbing expressions using [node glob](https://github.com/isaacs/node-glob). This is the same globbing format you might know from 
[Grunt](https://github.com/gruntjs/grunt) and [Karma](https://github.com/karma-runner/karma).

#### Files
**Command line:** `--files node_modules/a-lib/**/*.js,src/**/*.js,a.js,test/**/*.js` or `-f node_modules/a-lib/**/*.js,src/**/*.js,a.js,test/**/*.js`        
**Config file:** `files: ['test/helpers/**/*.js', 'test/unit/**/*.js', { pattern: 'src/**/*.js', included: false, mutated: true }]`  
**Default value:** *none*  
**Description:**  
With `files` you configure all files needed to run the tests. If the test runner you use already provides the test framework (jasmine, mocha, etc),
you should not add those files here as well. The order in this list is important, because that will be the order in which the files are loaded.  

When using the command line, the list can only contain a comma seperated list of globbing expressions.
When using the config file you can fill an array with strings or objects:

* `string`: A globbing expression used for selecting the files needed to run the tests.
* `{ pattern: 'pattern', included: true, mutated: false }` :
   * The `pattern` property is mandatory and contains the globbing expression used for selecting the files
   * The `included` property is optional and determines whether or not this file should be loaded initially by the test-runner (default: true)
   * The `mutated` property is optional and determines whether or not this file should be targeted for mutations (default: false)   

#### Files to mutate
**Command line:** `-m src/**/*.js,a.js` or `--mutate src/**/*.js,a.js`  
**Config file:** `mutate: ['src/**/*.js', 'a.js']`  
**Default value:** *none*  
**Description:** 
With `mutate` you configure the subset of files to target for mutation. These should be your source files. 
This is optional, as you can also use the `mutated` property with `files`, or not select files to be mutated at all to perform a dry-run (test-run).
Provide a comma seperated list of globbing expressions which will be used to select the files to be mutated.

#### Test runner 
**Command line:** `--testRunner karma`  
**Config file:** `testRunner: 'karma'`  
**Default value:** *none*  
**Description:**  
With `testRunner` you configure which test runner should run your tests. This option is required.
Make sure the plugin to use the test runner is installed next to stryker. For example install the `stryker-karma-runner` to use `karma` as test runner. 
See [stryker-mutator.github.io](http://stryker-mutator.github.io) for an up-to-date list of supported test runners and plugins.

#### Test framework 
**Command line:** `--testFramework jasmine`  
**Config file:** `testFramework: 'jasmine'`    
**Default value:** *none*  
**Description:**  
With `testFramework` you configure which test framework you used for your tests. The value you configure here is passed through to the test runner, 
so which values are supporterd here are determined by the test runner. By default, this value is also used for `testFramework`.  

#### Coverage analysis
**Full notation:** `--coverageAnalysis perTest`    
**Config file key:** `coverageAnalysis: 'perTest'`    
**Default value:** `perTest`  
**Description:**  
The coverage analysis strategy you want to use.
Stryker can analyse code coverage results. When doing so, it can potentially speed up mutation testing a lot, 
because only the tests covering a particular mutation are tested for each mutant. 
However this should *not* influence the resulting mutation testing score, only the performance.

Possible values are: 
* **off**: Stryker will not determine the covered code during the initial test run fase. All tests are always tested for each mutant during the mutation testing fase.
* **all**: Stryker will determine the covered code of all tests during the initial test run fase. Only mutants that are actually covered by your test suite are tested during the mutation testing fase. This setting requires your test runner to be able to *report* the code coverage back to Stryker, which is the case for the stryker-mocha-runner and the stryker-karma-runner.
* **perTest**: Stryker will determine the covered code per executed test during the initial test run fase. Only mutants that are actually covered by your test suite are tested during the mutation testing fase. Only those tests that cover a particular mutant are tested for each mutant. This requires your tests to be able to run independently of each other and in random order. In addition to the requirement for your test runner to be able to *report* the code coverage back to Stryker, your choosen testFramework also needs to support running code before and after each test and test filtering. 

#### Reporter
**Command line:** `--reporter clear-text,progress`  
**Config file:** `reporter: ['clear-text', 'progress']`     
**Default value:** `['clear-text', 'progress']`  
**Description:**  
With `reporter` you can set a reporter or group of reporters for stryker to use.
These reporters can be used out of the box: `clear-text`, `progress` and `event-recorder`.
By default `clear-text` and `progress` are active if no reporter is configured.
You can load additional plugins to get more reporters. See [stryker-mutator.github.io](http://stryker-mutator.github.io)
for an up-to-date list of supported reporter plugins and a description on each reporter.
  
#### Plugins
**Command line:** `--plugins stryker-html-reporter,stryker-karma-runner`  
**Config file:** `plugins: ['stryker-html-reporter', 'stryker-karma-runner']`  
**Default value:** `['stryker-*']`  
**Description:**  
With `plugins` you can add additional node-modules for stryker to load (or `require`).
By default, all node_modules beginning with `stryker-` will be loaded, so you would normally not need to specify this option.
These modules should be installed right next to stryker. For a current list of plugins,
you can consult [npm](https://www.npmjs.com/search?q=%40stryker-plugin) or 
[stryker-mutator.github.io](http://stryker-mutator.github.io).

#### Port
**Command line:** `--port 9234`  
**Config file:** `port: 9234`    
**Default value:** `9234`  
**Description:**  
A free port for the test runner to use (if it needs to). Any additional test runners will be spawned using n+1, n+2, etc.
For example, when you configure 9234 and Stryker decides to start 4 test runner processes, ports 9234 to 9237 will be passed to the test runner.
If the test runner decides to use the port, it should be free for use.

#### Abolute timeout ms
**Command line:** `--timeoutMs 5000`  
**Config file:** `timeoutMs: 5000`  
**Default value:** `5000`  
**Description:**  
When stryker is mutating code, it cannot determine indefinitely whether or not a code mutatation results in an infinite loop (see [Halting problem](https://en.wikipedia.org/wiki/Halting_problem)).
In order to battle infinite loops, a test run gets killed after a certain period. This period is configurable with two settings, `timeoutMs` and `timeoutFactor`. 

To determine the timeout in milliseconds for a test run, the following formula is used.

```
timeoutForTestRunMs = timeOfTheInitialTestRunMs * timeoutFactor + timeoutMs
``` 

With `timeoutFactor` you can configure the alowed deviation relative to the time of a normal test run. Tweak this if mutants are prone to create slower, but not infinite, code.
With `timeoutMs` you can configure an absolute deviation. Tweak this if you are running Stryker on a busy machine, where you need to wait longer to make sure that there indeed is an inifinite loop.  

#### Timeout factor
**Command line:** `--timeoutFactor 1.5`  
**Config file:** `timeoutFactor: 1.5`  
**Default value:** `1.5`  
**Description:**  
See [Abolute timeout ms](#abolute-timeout-ms).

#### Log level
**Command line:** `--logLevel info`    
**Config file:** `logLevel: 'info'`
**Default value:** `info`  
**Description:**  
 Set the log4js log level that Stryker uses. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "info"  
 *Note*: Test runners are run as child processes. All output (stdout) of the testRunner is logged as 'trace'.
 To see logging from the test runner, set the `logLevel` to `all` or `trace`.   
