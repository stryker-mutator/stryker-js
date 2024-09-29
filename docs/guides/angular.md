---
title: Angular
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/guides/angular.md
---

StrykerJS supports Angular projects using the Angular CLI starting from @angular/cli v9.0.0. If you're using an older version, check the tips below.

Angular 16 introduced [experimental support for Jest](https://blog.angular.io/angular-v16-is-here-4d7a28ec680d#1048), which is also supported in StrykerJS.

## Angular with Karma

:::note 

This setup only works with @angular/cli 9.0.0 or higher. If you're using an older version, we highly recommend upgrading to at least version 9.0.0 of the CLI. Refer to the [Angular Update Guide](https://update.angular.io/) for assistance. If upgrading isn't feasible, see [the legacy guide for Stryker 3 and Angular CLI 6.1-8.2](./legacy/stryker-3/angular.md).

:::

Install the Stryker packages using the command `npm init stryker`.

### Configuration

The `npm init stryker` command also creates a `stryker.config.json` or `stryker.config.mjs` configuration in your repository. Below is a basic configuration for Angular projects with karma as a test runner:

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "_comment": "This config was generated using a preset. Please see website for more information: https://stryker-mutator.io/docs/stryker-js/guides/angular",
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
  "ignorers": ["angular"],
  "concurrency": 4,
  "concurrency_comment": "Recommended to use about half of your available cores when running stryker with angular"
}
```

## Angular with experimental Jest support

:::note

Jest support in Angular is experimental, so the integration StrykerJS needs is not supported yet. Help improve this integration by up-voting [issue #25434 in the angular-cli issue tracker](https://github.com/angular/angular-cli/issues/25434). Below is a setup that currently works but may change in the future.

:::

### Install

Install the needed packages with the following command: 

```shell
npm i -D @stryker-mutator/core @stryker-mutator/jest-runner
```

### Configuration

Create a `stryker.config.json` file with the following content:

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "mutate": [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/test.ts",
    "!src/environments/*.ts"
  ],
  "testRunner": "jest",
  "buildCommand": "ng test",
  "buildCommand_comment": "ng test will build the project, also run the tests once. Please up-vote this issue to improve this behavior: https://github.com/angular/angular-cli/issues/25434",
  "jest": {
    "enableFindRelatedTests": false,
    "config": {
      "rootDir": "dist/test-out/browser",
      "testEnvironment": "jsdom",
      "testMatch": ["<rootDir>/**/*.mjs"],
      "setupFilesAfterEnv": [
        "<rootDir>/jest-global.mjs",
        "<rootDir>/polyfills.mjs",
        "<rootDir>/init-test-bed.mjs"
      ],
      "testPathIgnorePatterns": [
        "<rootDir>/jest-global.mjs",
        "<rootDir>/polyfills.mjs",
        "<rootDir>/init-test-bed.mjs",
        "<rootDir>/chunk-.*.mjs"
      ]
    }
  },
  "testRunnerNodeArgs": ["--experimental-vm-modules"],
  "ignorers": ["angular"],
  "reporters": [
    "progress",
    "clear-text",
    "html"
  ]
}
```

## Run

Run Stryker using `npx stryker run`.

## Check mutants for TypeScript type errors

Consider adding the Stryker TypeScript checker to increase mutation testing performance and kill mutants that would result in compilation errors:

1. Install `@stryker-mutator/typescript-checker` as a development dependency:
   `npm install --save-dev @stryker-mutator/typescript-checker`
1. Configure the TypeScript checker in `stryker.config.json`:
   ```json
   {
     "checkers": ["typescript"],
     "tsconfigFile": "tsconfig.json"
   }
   ```
   If you experience issues, try setting the `tsconfigFile` option to `tsconfig.app.json`.

## Troubleshooting

Please take a look at the [troubleshooting page](../troubleshooting.md) when you run into any problems setting up StrykerJS.
