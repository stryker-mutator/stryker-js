---
title: Angular
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/guides/angular.md
---

Stryker 4.0 and higher supports Angular projects using the Angular CLI starting from @angular/cli v9.0.0. Are you using an older version? Then there are some tips later in this document.

## @angular/cli 9.0.0 and higher

This setup only works with @angular/cli 9.0.0 or higher. Are you using an older version of Angular? Then we highly suggest upgrading to at least version 9.0.0 of the cli. You can use the [Angular Update Guide](https://update.angular.io/) to help you with this. If it's not possible for you to upgrade your Angular version, please check out [the legacy guide for Stryker 3 and Angular CLI 6.1-8.2](./legacy/stryker-3/angular.md).

## Install

Either install the Stryker CLI globally using `npm install --global stryker-cli`, or use `npx` in front of every Stryker command.
Install the Stryker packages using the command `stryker init`.

Recommended other packages:

- @angular/cli 9.0.0 or higher
- @angular-devkit/build-angular 0.900.0 or higher
- karma 4.3.0 or higher
- typescript 3.7.2 or higher

### Configuration

The `stryker init` command also creates a `stryker.conf.json` or `stryker.conf.js` configuration in your repository
like the one below which is a good starting point for Angular projects.
You may have to change some paths or config settings like the selected browsers.
We highly suggest using a headless browser when testing using Stryker.

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "_comment": "This config was generated using a preset. Please see website for more information: https://stryker-mutator.io/docs/guides/angular",
  "mutate": ["src/**/*.ts", "!src/**/*.spec.ts", "!src/test.ts", "!src/environments/*.ts"],
  "testRunner": "karma",
  "karma": {
    "configFile": "karma.conf.js",
    "projectType": "angular-cli",
    "config": {
      "browsers": ["ChromeHeadless"]
    }
  },
  "reporters": ["progress", "clear-text", "html"],
  "concurrency": 2,
  "concurrency_comment": "Recommended to use about half of your available cores when running stryker with angular",
  "coverageAnalysis": "perTest"
}
```

Consider adding the Stryker TypeScript checker to increase mutation testing performance and kill mutants that would result in compilation errors:

1. Install `@stryker-mutator/typescript-checker` as a development dependency:
   `npm install --save-dev @stryker-mutator/typescript-checker`
1. Configure the TypeScript checker in `stryker.conf.json`:
   ```json
   {
     "checkers": ["typescript"],
     "tsconfigFile": "tsconfig.json"
   }
   ```
   If you experience issues, try setting the `tsconfigFile` option to `tsconfig.app.json`.

### Run

Run Stryker using `stryker run`.
