# Stryker

*Professor X: For someone who hates mutants... you certainly keep some strange company.*  
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Work in progress
This repository is a work in progress. As of now, stryker is not published on NPM yet. We also only support Jasmine tests in the browser for now. Please create and vote on [issues](https://github.com/infosupport/stryker/issues) to help us determine the priority on features.

## Getting started
Stryker is a mutation testing framework for JavaScript. It allows you to test your test by temporarily inserting bugs.

To install stryker, do the following:
1. Download or clone the repository
2. Add `"stryker": "^0.0.1"` to devDependencies in your `package.json`
3. Run the command `npm link ../path/to/styker/` from the root of your project
4. Run the command `node node_modules/stryker/src/Stryker.js --help` to test if stryker works

***Note**: During the installation you may run into errors caused by [node-gyp](https://github.com/nodejs/node-gyp). It is safe to ignore these errors.*

## Configuration
### Available options
#### Source files
**Short notation:** -s
**Full notation:** --src
**Optional:** **No**
**Description:**
The list of source files which should be mutated, separated by comma's.
**Example:** -s src/a.js,src/b.js

#### Test files
**Short notation:** -t
**Full notation:** --tests
**Optional:** **No**
**Description:**
The list of test files which should be tested, separated by comma's.
**Example:** -t test/a.js,test/b.js

#### Library files
**Short notation:** -l
**Full notation:** --libs
**Optional:** Yes
**Description:**
The list of library files which are required to run the tests, separated by comma's. These files will not be mutated.
**Example:** -l lib/a.js,src/b.js

#### Constant timeout
**Short notation:** -m
**Full notation:** --timeout-ms
**Optional:** Yes
**Default:** 3000
**Description:**
The amount of extra time (in milliseconds) a mutation test may take compared to the original test before a timeout occcurs.
**Example:** -m 5000

#### Timeout factor
**Short notation:** -f
**Full notation:** --timeout-factor
**Optional:** Yes
**Default:** 1.25
**Description:**
A factor which is applied to the time a mutation-test may take. This factor is applied after the constant timeout.
For example, if the normal test took 100ms, the constant timeout is 500ms and the timeout factor is 2.0, a mutation test will timeout if it takes longer than 1200ms.
**Example:** -f 1.50

#### Individual tests
**Short notation:** -i
**Full notation:** --individual-tests
**Optional:** Yes
**Default:** false
**Description:**
Stryker will always attempt to run the least amount of tests when testing a mutant to ensure the best performance.
By default Stryker does not select individual tests but instead it selects entire test files.
Splitting these test files into separate tests *can* cause a performance gain in certain projects, but it *can* also slow Stryker down.
**Example:** -i

### Default config
By default, stryker requires two arguments: the source and test files.  
When calling stryker with multiple source and/or test files, they have to be separated using comma's.

A basic usage of stryker is:
```
node node_modules/stryker/src/Stryker.js –s src/myFirstFile.js,src/mySecondFile.js –t test/myFirstFileSpec.js,test/mySecondsFileSpec.js
```

### Complete config
The configuration below uses all available options for demonstration purposes:
```
node node_modules/stryker/src/Stryker.js –s src/myFirstFile.js,src/mySecondFile.js –t test/myFirstFileSpec.js,test/mySecondsFileSpec.js -m 5000 -f 1.50 --individual-tests
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
