[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/grunt-stryker.svg)](https://www.npmjs.com/package/grunt-stryker)
[![Node version](https://img.shields.io/node/v/grunt-stryker.svg)](https://img.shields.io/node/v/grunt-stryker.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Grunt-stryker

For more info on stryker, please visit [stryker-mutator.io](https://stryker-mutator.io).

## Getting Started
This plugin requires Grunt `~0.4.5` and @stryker-mutator/core `^1.0.0`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin using the following commands:

```
npm install stryker stryker-api grunt-stryker --save-dev
```

Once stryker and the plugin have been installed, the plugin may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-stryker');
```

## The "stryker" task

### Overview
In your project's Gruntfile, add a section named `stryker` to the data object passed into `grunt.initConfig()` and then add a task.
In this example we've called the task `jasmine` due to the fact that we plan on using the task for running Jasmine tests, but feel free to use any name you want.

```js
grunt.initConfig({
  stryker: {
    jasmine: {
      files: {
        libs: [/* List your library files here */],
        src: [/* List your source files here */],
        tests: [/* List your test files here */]
      },
      mutate: {
        src: [/* List the files that you want to mutate here */]
      }
    },
  },
});
```

### Options

#### files
Type: `Object`

An object with arrays of globbing expressions used for selecting all files needed to run the tests. These include: test files, library files, source files (the files selected with `mutate`) and any other file you need to run your tests. The order of the files specified here will be the order used to load the file in the test runner (karma).

#### mutate
Type: `Object`

An object with arrays of globbing expressions used for selecting the files that should be mutated.

### options.configFile
Type: `string`

A location to a [Stryker config file](https://github.com/stryker-mutator/stryker#config-file). That file should export a function which accepts a "config" object.
On that object you can configure all options as an alternative for the Gruntfile.
If an option is configured in both the Gruntfile and in the config file, the Gruntfile wins.
An example config:
```javascript
module.exports = function(config){
  config.set({
    files: ['src/**/*.js', 'test/myFirstFile.spec.js', 'test/mySecondFile.spec.js'],
    mutate: ['src/**/*.js'],
    logLevel: 'debug'
  });
}
```

### Other options
All options will be passed through to `Stryker` itself. See [the readme there](https://github.com/stryker-mutator/stryker#stryker) for more info.

### Usage Examples

#### Default Options
In this example, we run mutation testing using every JavaScript file in the `src` folder and every file in the `test` folder except for `test/IgnoredTestFile.js`.
We've called the task `jasmine` here due to the fact that we plan on using the task for running Jasmine tests, but feel free to use any name you want.
Feel free to also choose the names of the arrays of files, we've used `src` and `tests` in this example.

```js
grunt.initConfig({
  stryker: {
    jasmine: {
      files: {
        src: ['src/**/*.js'],
        tests: ['test/**/*.js', '!test/IgnoredTestFile.js']
      },
      mutate: {
        src: ['src/**/*.js']
      }
    },
    options: {
        testFramework: 'jasmine',
        testRunner: 'karma'
    }
  },
});
```

#### Config file
In this example, we run grunt-stryker using a config file. We **could overwrite** the config file by manually configuring our grunt task as well.

```js
// Gruntfile.js
grunt.initConfig({
  stryker: {
    jasmine: {
      options: {
        configFile: 'stryker.conf.js'
      }
    },
  },
});
```

The content of the file `stryker.conf.js` in this example is:

```javascript
// stryker.conf.js
module.exports = function(config){
  config.set({
    files: [{ pattern: 'src/**/*.js', mutated: true} , 'test/myFirstFile.spec.js', 'test/mySecondFile.spec.js'],
    testFramework: 'jasmine',
    testRunner: 'karma'
  });
}
```
**Note:** It's not possible to exclude files in a config file using `!` like: `!myFile.js`. This is possible when you don't use a config file but define the options your Gruntfile.
See [node-glob](https://github.com/isaacs/node-glob#glob) to know what *is* possible.

## Supported mutations
For the list of supported mutations, please take a look at the [mutations supported by stryker](https://github.com/stryker-mutator/stryker#supported-mutations)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
