[![Build Status](https://travis-ci.org/infosupport/stryker.svg?branch=master)](https://travis-ci.org/infosupport/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker.svg)](https://www.npmjs.com/package/stryker)
[![Gitter](https://badges.gitter.im/infosupport/stryker.svg)](https://gitter.im/infosupport/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Stryker

*Professor X: For someone who hates mutants... you certainly keep some strange company.*  
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Work in progress
This repository is a work in progress. We only support Jasmine tests in the browser for now. Please create and vote on [issues](https://github.com/infosupport/stryker/issues) to help us determine the priority on features.

## Getting started
Stryker is a mutation testing framework for JavaScript. It allows you to test your test by temporarily inserting bugs.

To install stryker, execute the command:
```
npm install stryker --save-dev
```
***Note****: During the installation you may run into errors caused by [node-gyp](https://github.com/nodejs/node-gyp). It is safe to ignore these errors.*

To test if stryker is working, execute the command:
```
node node_modules/stryker/dist/src/Stryker.js --help
```

## Configuration
### Available options
#### Files to mutate
**Short notation:** -m  
**Full notation:** --mutate  
**Optional:** **No**  
**Description:**  
A comma seperated list of globbing expression used for selecting the files that should be mutated.  
**Example:** -m src/\*\*/\*.js,a.js`

#### All files
**Short notation:** -f  
**Full notation:** --files  
**Optional:** **No**  
**Description:**  
A comma seperated list of globbing expression used for selecting all files needed to run the tests. These should be: test files, library files, source files and any other file you need to run your project. The order of the files could have an impact on the test result.  
**Example:** -f node_modules/a-lib/\*\*/\*.js,src/\*\*/\*.js,a.js,test/\*\*/\*.js

### Default config
By default, stryker requires two arguments: the source and test files.  
When calling stryker with multiple source and/or test files, they have to be separated using comma's.

A basic usage of stryker is:
```
node node_modules/stryker/src/Stryker.js –m src/myFirstFile.js,src/mySecondFile.js –f libs/externalLibrary.js,src/myFirstFile.js,src/mySecondFile.js,test/*.js,
```

## Supported mutations
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
