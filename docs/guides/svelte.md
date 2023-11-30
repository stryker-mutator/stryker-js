---
title: Svelte
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/guides/svelte.md
---

Stryker supports Svelte projects out-of-the-box as of Svelte version `>=3.30`. It will also mutate `.svelte` files using your installed version of the svelte compiler.

<details>

<summary>History</summary>

| Version | Changes                                  |
| ------- | ---------------------------------------- |
| 8.0     | Add support for mutating `.svelte` files |

</details>


## Vitest

This guide assumes you're using the [vitest examples](https://vitest.dev/guide/#examples) as a starting point for unit testing svelte projects with vitest.

### Install

Recommended stryker packages: `npm i -D @stryker-mutator/core @stryker-mutator/vitest-runner`

### Configuration

After installing the recommended packages, create the `stryker.config.json` file in your repository.
The configuration below contains a good starting point for Svelte projects.
You may have to change some paths like the [mutate](../configuration.md#mutate-string) array.

```json
{
  "testRunner": "vitest"
}
```

## Jest

Using jest to test your svelte projects can be done using something like the [svelte-jester](https://github.com/svelteness/svelte-jester#svelte-jester) plugin.


### Install

Recommended stryker packages: `npm i -D @stryker-mutator/core @stryker-mutator/jest-runner`

### Configuration

After installing the recommended packages, create the `stryker.config.json` file in your repository.
The configuration below contains a good starting point for Svelte projects.
You may have to change some paths like the [mutate](../configuration.md#mutate-string) array.

```json
{
  "testRunner": "jest"
}
```

If you're using native esm, you will also need to set the `--experimental-vm-modules` flag.

```diff
{
  "testRunner": "jest",
+ "testRunnerNodeArgs": ["--experimental-vm-modules"]
}
```
