[![Build Status](https://travis-ci.org/stryker-mutator/stryker-html-reporter.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker-html-reporter)
[![NPM](https://img.shields.io/npm/dm/stryker-html-reporter.svg)](https://www.npmjs.com/package/stryker-html-reporter)
[![Node version](https://img.shields.io/node/v/stryker-html-reporter.svg)](https://img.shields.io/node/v/stryker-html-reporter.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

#Stryker HTML Reporter

An HTML Reporter for the JavaScript mutation testing framework [Stryker](https://stryker-mutator.github.io)

## Warning
The stryker-html-reporter will be available from stryker v0.4.0 onward (which should be released soon).

## Example

Click on the image below to see a real-life example of a report generated from a test un on stryker itself!

[![example](https://github.com/stryker-mutator/stryker-html-reporter/raw/master/example.png)](https://stryker-mutator.github.io/stryker-html-reporter)

## Install

Install stryker-html-reporter from your project folder:

```bash
npm i --save-dev stryker-html-reporter
```

## Configuring

You can either configure the html reporter from the `stryker.conf.js` file or from the command line. This readme describes how to do it via the config file.

### Load the plugin

In order to use the `stryker-html-reporter` it must be loaded in the stryker mutation testing framework via the stryker configuration. 
Easiest is to *leave out* the `plugins` section from your config entirely. That way, all node_modules starting with `stryker-` will be loaded.

If you do descide to choose specific modules, don't forget to add `'stryker-html-reporter'` to the list of plugins to load.

### Use the reporter

In order to use the reporter, you must add `'html'` as single reporter or add it to the list. For example: `reporter: 'html'` or `reporter: ['html', 'progress']`.

### Options

You can configure the html reporter by adding a `htmlReporter` to your config.

#### htmlReporter.baseDir

Configure the base directory to write the html report to. 

### Full config example

```javascript
// stryker.conf.js
exports = function(config){
    config.set({
        // ...
        reporter: 'html', // or ['html', 'progress'] to configure multiple reporters at once
        htmlReporter: {
            baseDir: 'reports/mutation/html' // this is the default
        },
        plugins: ['stryker-html-reporter'] // Or leave out the plugin list entirely to load all stryker-* plugins directly
        // ...
    });
}
```

## Usage

Use Stryker as you normally would. The report will be available where you have configured it, or in the `reports/mutation/html` as a default.
See [http://stryker-mutator.github.io](http://stryker-mutator.github.io) for more info. 
