# `eslint-checker`

An ESLint type checker plugin for [StrykerJS](https://stryker-mutator.io), the JavaScript Mutation testing framework.
This plugin enables lint testing on mutants, so you won't have to waste time on mutants which results in a lint error.

# Features

👽 Lint check each mutant. Invalid mutants will be marked as CompileError in your Stryker report.

🧒 Easy to setup, only your `.eslintrc.*` file is needed.

🔢 Lint check is done in-memory, no side effects on disk.

🎁 Support for javascript projects (including type-aware projects), as well as typescript projects.

# Configuring

You can configure the typescript checker in the `stryker.conf.js` (or `stryker.conf.json`) file.

```json
{
  "checkers": ["eslint"],
  "lintConfigFile": ".eslintrc.json"
}
```

## `lintConfigFile` [`string`]

Default: `.eslintrc.*`

The path to your [eslint configuration file](https://eslint.org/docs/user-guide/configuring/configuration-files#using-configuration-files).

_Note: the following eslint options are always overridden by @stryker-mutator/eslint-checker to avoid false positives, based on a similar reasoning to that in [@stryker-mutator/typescript-checker](https://stryker-mutator.io/docs/stryker-js/typescript-checker/)_

```json
{
  "no-unused-vars": "off",
  "import/no-unresolved": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "@typescript-eslint/no-empty-function": "off"
}
```

## Peer dependendies

The `@stryker-mutator/eslint-checker` package uses `eslint` under the hood. As such, you should make sure you have the correct versions of its dependencies installed:

- `@stryker-mutator/core`
- `eslint`

For current versions, see the `peerDependencies` section in the [package.json](./package.json).
