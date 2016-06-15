[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker.svg)](https://www.npmjs.com/package/stryker)
[![Node version](https://img.shields.io/node/v/stryker.svg)](https://img.shields.io/node/v/stryker.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](stryker-80x80.png)
# Stryker

*Professor X: For someone who hates mutants... you certainly keep some strange company.*  
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Work in progress
This repository is a work in progress. We only support Jasmine tests in the browser for now. Please create and vote on [issues](https://github.com/stryker-mutator/stryker/issues) to help us determine the priority on features.

## Getting started
Stryker is a mutation testing framework for JavaScript. It allows you to test your test by temporarily inserting bugs.

To install stryker, execute the command:
```
npm install stryker --save-dev
```
***Note****: During the installation you may run into errors caused by [node-gyp](https://github.com/nodejs/node-gyp). It is safe to ignore these errors.*

To test if stryker is working, execute the command:
```
node node_modules/stryker/src/Stryker.js --help
```

## Usage

Stryker can be used in two ways:

1. Using a config file `node node_modules/stryker/src/Stryker.js -c stryker.conf.js`
2. Using command line arguments `node node_modules/stryker/src/Stryker.js –m src/file.js,src/file2.js –f libs/externalLibrary.js,src/file2.js,src/file.js,test/*.js --testFramework 'jasmine' --testRunner 'karma'`

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

All options are optional except the `files` (or `-f`), `mutate` (or `-m`), `testFramework` and `testRunner` options. 
With `files` you configure all files needed to run the tests, except the test framework files themselves (jasmine).
The order in this list is important, because that will be the order in which the files are loaded.
With `mutate` you configure the subset of files to target for mutation. These should be your source files.
With `testFramework` you configure which test framework you used for your tests. Currently **only** `'jasmine'` is supported.
With `testRunner` you configure which framework should run your tests. Currently **only** `'karma'` is supported.

Both the `files` and `mutate` options are a list of globbing expressions. The globbing expressions will be resolved
using [node glob](https://github.com/isaacs/node-glob). This is the same globbing format you might know from 
[Grunt](https://github.com/gruntjs/grunt) and [Karma](https://github.com/karma-runner/karma).
The way to provide this list is as an array in the config file, or as a comma seperated list on the command line (without spaces or quotes) 

## Configuration
Options can be configured either via the command line or via a config file.

### Avalailable options
#### Files to mutate
**Short notation:** `-m`  
**Full notation:** `--mutate`  
**Config file key:** `mutate`  
**Description:**  
A comma seperated list of globbing expressions used for selecting the files that should be mutated.  
**Example:** `-m src/\*\*/\*.js,a.js`

#### All files
**Short notation:** `-f`  
**Full notation:** `--files`    
**Config file key:** `files`   
**Description:**  
A comma seperated list of globbing expressions used for selecting all files needed to run the tests.
These include: test files, library files, source files (the files selected with `--mutate`) and any other file you need to run your tests. 
The order of the files specified here will be the order used to load the file in the test runner (karma).   
**Example:** `-f node_modules/a-lib/\*\*/\*.js,src/\*\*/\*.js,a.js,test/\*\*/\*.js`

#### Test framework 
**Full notation:** `--testFramework`  
**Config file key:** `testFramework`  
**Description:**  
The test framework you want to use. Currently supported frameworks: `'jasmine'`  
**Example:** `--testFramework 'jasmine'`

#### Test runner 
**Full notation:** `--testRunner`  
**Config file key:** `testRunner`  
**Description:**  
The test runner you want to use. Currently supported runners: `'karma'`  
**Example:** `--testFramework 'karma'`

#### Log level
**Short notation:** (none)  
**Full notation:** `--logLevel`  
**Config file key:** `logLevel`  
**Description:**  
 Set the log4js loglevel. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "info"

### Config file
**Short notation:** `-c`  
**Full notation:** `--configFile`  
**Description:**  
A location to a config file. That file should export a function which accepts a "config" object.
On that object you can configure all options as an alternative for the command line. 
If an option is configured on both the command line and in the config file, the command line wins.
An example config: 
```javascript
module.exports = function(config){
  config.set({
    files: ['../../../sampleProject/src/?(Circle|Add).js', '../../../sampleProject/test/?(AddSpec|CircleSpec).js'],
    mutate: ['../../../sampleProject/src/?(Circle|Add).js'],
    testFramework: 'jasmine',
    testRunner: 'karma',
    logLevel: 'debug'
  });
}
```

## Supported mutators
### Math
| Original | Mutated  |
| -------- | -------- |
| a + b    | a - b    |
| a - b    | a + b    |
| a * b    | a / b    |
| a / b    | a * b    |
| a & b    | a * b    |

### Unary
| Original | Mutated  |
| -------- | -------- |
| a++      | a--      |
| a--      | a++      |
| ++a      | --a      |
| --a      | ++a      |
| +a       | -a       |
| -a       | +a       |

### Conditional boundary
| Original | Mutated  |
| -------- | -------- |
| a < b    | a <= b   |
| a <= b   | a < b    |
| a > b    | a >= b   |
| a >= b   | a < b    |

### Reverse conditional
| Original | Mutated  |
| -------- | -------- |
| a == b   | a != b   |
| a != b   | a == b   |
| a === b  | a !== b  |
| a !== b  | a === b  |
| a <= b   | a > b    |
| a >= b   | a < b    |
| a < b    | a >= b   |
| a > b    | a <= b   |
| a && b   | a \|\| b   |
| a \|\| b   | a && b   |

### Remove conditionals
| Original                         | Mutated                         |
| -------------------------------- | ------------------------------- |
| for (var i = 0; i < 10; i++) { } | for (var i = 0; false; i++) { } |
| while (a > b) { }                | while (false) { }               |
| do { } while (a > b);            | do { } while (false);           |
| if (a > b) { }                   | if (true) { }                   |
| if (a > b) { }                   | if (false) { }                  |

### Block statement
This mutator removes the content of every block statement. For example the code:
```js
function saySomething() {
   console.log('Hello world!');   
}
```
becomes:
```js
function saySomething() { 
}
```
