---
title: Angular
custom_edit_url: https://github.com/stryker-mutator/stryker/edit/master/docs/guides/legacy/stryker-3/angular.md
---

Stryker supports Angular projects using the Angular CLI between @angular/cli 6.1.0 and 8.3.29. Are you using an older version? Then there are some tips later in this document.

## @angular/cli 6.1.0-8.3.29

This setup only works with @angular/cli 6.1.0-8.3.29. Are you using an older version of Angular? Then we highly suggest upgrading to at least version 6.1.0 of the cli. You can use the [Angular Update Guide](https://update.angular.io/) to help you with this. If it's not possible for you to upgrade your Angular version, please check out [this repo and its commits](https://github.com/nicojs/angular-stryker-example).

## Install

Install the Stryker packages using this command: `npm i -D @stryker-mutator/core@3 @stryker-mutator/karma-runner@3 @stryker-mutator/typescript@3 @stryker-mutator/html-reporter@3`

Recommended other packages:

- @angular/cli 6.1.0-8.3.29
- @angular-devkit/build-angular 0.7.2-0.803.29
- karma 2.0.4 or higher
- typescript 2.4.2 or higher

### Configuration

After installing the recommended packages, create the `stryker.conf.js` file in your repository.
The configuration below contains a good starting point for Angular projects.
You may have to change some paths or config settings like the selected browsers.
We highly suggest using a headless browser when testing using stryker.

Coverage analysis with [@stryker-mutator/jasmine-framework](http://npmjs.com/package/@stryker-mutator/jasmine-framework) is unfortunately not supported as of right now.

```js
module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/test.ts', '!src/environments/*.ts'],
    mutator: 'typescript',
    testRunner: 'karma',
    karma: {
      configFile: 'src/karma.conf.js',
      projectType: 'angular-cli',
      config: {
        browsers: ['ChromeHeadless'],
      },
    },
    reporters: ['progress', 'clear-text', 'html'],
    // maxConcurrentTestRunners: 2, // Recommended to not use all cores when running stryker with angular.
    coverageAnalysis: 'off',
  });
};
```

It is recommended to configure the `maxConcurrentTestRunners` option and configure about half of your available cores there.

### Run

Run Stryker using `npx stryker run`
