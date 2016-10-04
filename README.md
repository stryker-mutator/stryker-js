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
node node_modules/stryker/bin/stryker --help
```

## Usage

Stryker can be used in two ways:

1. Using a config file `node node_modules/stryker/bin/stryker -c stryker.conf.js`
2. Using command line arguments `node node_modules/stryker/bin/stryker –m src/file.js,src/file2.js –f libs/externalLibrary.js,src/file2.js,src/file.js,test/*.js --testFramework 'jasmine' --testRunner 'karma'`

The config file is *not* a simple json file, it should be a common js (a.k.a. npm) module looking like this:
```javascript
module.exports = function(config){
  config.set({
    // Your config here
  });
}
```
You might recognize this way of working from the karma test runner.
 
If both the config file and command line options are combined, the command line arguments will overrule the options in the config file.

All options are optional except the `files` (or `-f`) and `testRunner` options.  

Both the `files` and `mutate` options are a list of globbing expressions. The globbing expressions will be resolved
using [node glob](https://github.com/isaacs/node-glob). This is the same globbing format you might know from 
[Grunt](https://github.com/gruntjs/grunt) and [Karma](https://github.com/karma-runner/karma).
The way to provide this list is as an array in the config file, or as a comma seperated list on the command line (without spaces or quotes) 

## Supported mutators
The mutators that are supported by Stryker can be found on [our website](http://stryker-mutator.github.io/mutators.html)

## Configuration
Options can be configured either via the command line or via a config file.

### Avalailable options
#### Config file
**Command line:** `-c stryker.conf.js` or `--configile stryker.conf.js`    
**Config file:** *none, used to set the config file*  
**Default value:** *none*  
**Description:**  
A location to a config file. That file should export a function which accepts a "config" object.
On that object you can configure all options as an alternative for the command line. 
If an option is configured on both the command line and in the config file, the command line wins.
An example config: 

```javascript
module.exports = function(config){
  config.set({
    files: ['test/helpers/**/*.js', 'test/unit/**/*.js', { pattern: 'src/**/*.js', included: false, mutated: true }],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'clear-text', 'html', 'event-recorder'],
    testSelector: null,
    plugins: ['stryker-mocha-runner', 'stryker-html-reporter']
  });
}
```

#### All files
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
**Config file:** `mutate: ['src/**/*.js', 'a.js']  
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
so which values are supporterd here are determined by the test runner. By default, this value is also used for `testSelector`.  

#### Test selector
**Full notation:** `--testSelector jasmine` or `--testSelector null`    
**Config file key:** `testSelector: 'jasmine'` or `testSelector: null`    
**Default value:** *none*  
**Description:**  
Stryker kan use a test selector to select individual or groups of tests. If a test selector is used, it can potentially speed up the tests, 
because only the tests covering a particular mutation are ran. If this value is left out, the value of the `testFramework` is used
to determine the `testSelector`. Currently **only** `'jasmine'` is supported. If you use an other test framework, or you want to disable test selection for an other reason,
you can explicitly disable the testSelector by setting the value to `null`. 

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