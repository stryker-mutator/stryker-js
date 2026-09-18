---
title: VueJS
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/guides/vuejs.md
---

Stryker supports Vue projects. It can mutate both your js/ts files as the script tags in your `*.vue` files.

This article will explain how to configure Stryker with [vue](https://vuejs.org/guide/quick-start.html).

To get started using Stryker with vue, first install the core package: `npm i -D @stryker-mutator/core` or `yarn add --dev @stryker-mutator/core`. Next follow the guide for the Vitest runner.

Keep in mind that you may have to change some configuration settings such as paths to files.

## `<script setup>` support

For a single file component that uses [`<script setup>`](https://vuejs.org/api/sfc-script-setup.html), Stryker places its instrumentation header in a module level `<script>` block rather than inside the `<script setup>` block. When the file doesn't already have a plain `<script>` block, Stryker creates one and copies the `lang` of the `<script setup>` block onto it.

This only happens when a mutant is placed inside an argument of a Vue compiler macro (`defineProps`, `defineEmits`, `defineOptions`, `defineModel`, `defineSlots` or `withDefaults`). Every other file keeps the exact same output it had before. The reason is that the Vue compiler hoists a macro argument out of `setup()`, so helpers declared inside `<script setup>` (including Stryker's own instrumentation helpers) are no longer reachable from it. See [#6178](https://github.com/stryker-mutator/stryker-js/issues/6178) for more information.

Adding a plain `<script>` block also turns off Vue's static hoisting of literals in the generated code. This changes the generated code, not the behavior of your component.

The string literal that names a model, e.g. `defineModel('name')`, is never mutated. It shows up as ignored in your report, because the Vue compiler reads that literal statically to derive the prop and event names, and mutating it would rename the model instead of testing anything.

A `<script setup>` block with a `src` attribute, or with a `lang` Stryker doesn't recognize, is skipped and keeps the behavior it had before.

## Vitest configuration

1. Install the `@stryker-mutator/vitest-runner` plugin: `npm i -D @stryker-mutator/vitest-runner` or `yarn add --dev @stryker-mutator/vitest-runner`.
1. Create a "stryker.config.json" file that looks like this:
   ```json
   {
     "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
     "testRunner": "vitest",
     "plugins": ["@stryker-mutator/vitest-runner"]
   }
   ```
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
