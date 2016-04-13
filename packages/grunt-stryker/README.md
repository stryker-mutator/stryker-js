# Grunt-stryker

*Professor X: For someone who hates mutants... you certainly keep some strange company.*  
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Work in progress
Stryker is a work in progress. We only support Jasmine tests in the browser for now. Please create and vote on [stryker's issues](https://github.com/infosupport/stryker/issues) to help us determine the priority on features.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin using the following commands:

```
npm install stryker --save-dev
npm install grunt-stryker --save-dev
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

### Usage Examples

#### Default Options
In this example, we run mutation testing on every JavaScript file in the `src` folder except for `src/IgnoredSourceFile.js`. The same goes for the tests.  
We've called the task `jasmine` here due to the fact that we plan on using the task for running Jasmine tests, but feel free to use any name you want.  
Feel free to also choose the names of the arrays of files, we've used `src` and `tests` in this example.

```js
grunt.initConfig({
  stryker: {
    jasmine: {
      files: {
        src: ['src/**/*.js', '!src/IgnoredSourceFile.js'],
        tests: ['test/**/*.js', '!test/IgnoredTestFile.js']
      },
      mutate: {
        src: ['src/**/*.js', '!src/IgnoredSourceFile.js']
      }
    },
  },
});
```

## Supported mutations
For the list of supported mutations, please take a look at the [mutations supported by stryker](https://github.com/stryker-mutator/stryker#supported-mutations)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
