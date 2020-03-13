[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Dhtml-reporter)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=html-reporter)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/html-reporter.svg)](https://www.npmjs.com/package/@stryker-mutator/html-reporter)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/html-reporter.svg)](https://img.shields.io/node/v/@stryker-mutator/html-reporter.svg)
[![Slack Chat](https://img.shields.io/badge/slack-chat-brightgreen.svg?logo=slack)](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)

## DEPRECATED: Starting from @stryker-mutator/core version 3.0.0 the HTML reporter is included with Stryker and enabled by default. There is no reason to install this package.

# Stryker HTML Reporter

An HTML Reporter for the JavaScript mutation testing framework [Stryker](https://stryker-mutator.io)

## Example

Click on the image below to see a real-life example of a report generated from a test run on stryker itself!

[![example](https://raw.githubusercontent.com/stryker-mutator/stryker/master/packages/html-reporter/example.png)](https://stryker-mutator.io/stryker-html-reporter)

## Install

Install @stryker-mutator/html-reporter from your project folder:

```bash
npm i --save-dev @stryker-mutator/html-reporter
```

## Configuring

You can either configure the html reporter from the `stryker.conf.js` file or from the command line. This readme describes how to do it via the config file.

### Load the plugin

In order to use the `@stryker-mutator/html-reporter` it must be loaded in the stryker mutation testing framework via the stryker configuration.
Easiest is to *leave out* the `plugins` section from your config entirely. That way, all node_modules starting with `@stryker-mutator/*` will be loaded.

If you do descide to choose specific modules, don't forget to add `'@stryker-mutator/html-reporter'` to the list of plugins to load.

### Use the reporter

In order to use the reporter, you must add `'html'` to the reporters. For example: `reporters: ['html', 'progress']`.

### Options

You can configure the html reporter by adding a `htmlReporter` object to your config.

#### htmlReporter.baseDir

Configure the base directory to write the html report to.

### Full config example

```javascript
// stryker.conf.js
exports = function(config){
    config.set({
        // ...
        reporters: ['html'], // You may also want to specify other reporters
        htmlReporter: {
            baseDir: 'reports/mutation/html' // this is the default
        },
        plugins: ['@stryker-mutator/html-reporter'] // Or leave out the plugin list entirely to load all @stryker-mutator/* plugins directly
        // ...
    });
}
```

## Usage

Use Stryker as you normally would. The report will be available where you have configured it, or in the `reports/mutation/html` as a default.
See [https://stryker-mutator.io](https://stryker-mutator.io) for more info.
