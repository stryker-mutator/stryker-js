---
title: Config file
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/config-file.md
---

Although a config file is not mandatory, it is recommended. You can define your Stryker configuration in either a JavaScript or JSON file. If you use a JavaScript file, it should export the configuration object. Autocompletion is supported using JSON schema or using [`@type` JS docs](https://jsdoc.app/).

## Configuration options

See [configuration](./configuration.md) for a list of available options.

## Setup

With a `stryker.config.json`:

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "_comment": "Comments can be put inside `xxx_comment` properties."
}
```

Or as `stryker.config.js`:

```js
// @ts-check
/**
* @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
*/
module.exports = {
  // Your config here
};
```

Since Stryker version 6 you can define your config in a native [ECMAScript module](https://nodejs.org/api/esm.html). Either using the `.mjs` extension, or `.js` if you use `{ "type": module" }` in your `package.json`.

```js
// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  // Your config here
};
export default config;
```

You can use your editor's autocompletion to help you author your configuration file.

![config file autocompletion](./images/config-file-autocompletion.gif)

## Usage

By default, Stryker will look for a config file in the current working directory. The default config file names are:
- `stryker.conf.{json,js,mjs,cjs}`
- `.stryker.conf.{json,js,mjs,cjs}`
- `stryker.config.{json,js,mjs,cjs}`
- `.stryker.config.{json,js,mjs,cjs}`

You can also use a different configuration file with a second argument to the `run` command.
```shell
# Use default config file names in the current working directory
npx stryker run
# Use "alternative-stryker.config.json"
npx stryker run alternative-stryker.config.json
```

## Glob patterns

Some options allow for a glob pattern to be defined. These glob patterns are defined relative to the cwd.

For example, using `"mutate": [ "src/components/**/*.component.js" ]` will make sure only files ending with ".component.js" in the "src/components" directory are mutated.

We suggest using [https://globster.xyz/](https://globster.xyz/) when auditing more complex glob expressions; it can help you get them just right.

## Example

The following is an example `stryker.config.json` file. It specifies running mocha tests with the mocha test runner.

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "testRunner": "mocha",
  "coverageAnalysis": "perTest"
}
```
