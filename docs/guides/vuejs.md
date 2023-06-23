---
title: VueJS
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/guides/vuejs.md
---

Stryker supports Vue projects. It can mutate both your js/ts files as the script tags in your `*.vue` files.

This article will explain how to configure Stryker with [vue](https://vuejs.org/guide/quick-start.html).

To get started using Stryker with vue, first install the core package: `npm i -D @stryker-mutator/core` or `yarn add --dev @stryker-mutator/core`. Next follow the guide for the Vitest runner.

Keep in mind that you may have to change some configuration settings such as paths to files.

## Vitest configuration

1. Install the `@stryker-mutator/vitest-runner` plugin: `npm i -D @stryker-mutator/vitest-runner` or `yarn add --dev @stryker-mutator/vitest-runner`.
1. Create a "stryker.conf.json" file that looks like this:
   ```json
   {
     "$schema": "../../node_modules/@stryker-mutator/core/schema/stryker-schema.json",
     "testRunner": "vitest",
     "coverageAnalysis": "perTest",
     "plugins": ["@stryker-mutator/vitest-runner"]
   }
   ```
1. Add `stryker-tmp` to your `.gitignore` file.
1. Add this script to your package.json:
   ```json
   {
     "scripts": {
       "test:mutation": "stryker run"
     }
   }
   ```

Now give it a go with `npm run test:mutation` or `yarn test:mutation`.

Please take a look at the [troubleshooting page](../troubleshooting.md) when you run into any problems setting up StrykerJS.
