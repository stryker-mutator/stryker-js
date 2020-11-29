---
title: Testing TypeScript with tsnode
custom_edit_url: https://github.com/stryker-mutator/stryker/edit/master/docs/guides/testing-typescript-with-tsnode.md
---

## Projects using `ts-node` to test TypeScript files

If you are creating a project which tests TypeScript source files using `ts-node` as a just-in-time transpiler, the following setup may be required for you.

If you manage the compilation of your code through a `tsconfig.json` file, this guide ensures that your TypeScript code is compiled against that configuration when it is being run in the Stryker sandbox.

> This guide does not cover using `@stryker-mutator/typescript-checker`. Please review the page [here](../typescript-checker.md) if you would like to include the typescript checker.

### Configuration

The following _additional_ items may be required to add to your `stryker.conf.js` file. This guide assumes that you have already generated a Stryker configuration file, so the following properties will need either adding or changing within the existing configuration.

```js
/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  buildCommand: 'tsc --build path/to/your/tsconfig.json',
  commandRunner: {
    command: 'npm run test:ts',
  },
  files: [
    'glob/for/your/typescript/source/files',
    'glob/for/your/typescript/test/files',
    'path/to/your/tsconfig.json/file',
  ],
};
```

In addition, you may be required to create a script in your `package.json` file to run this configuration with the following:

```bash
TS_NODE_PROJECT=path/to/your/tsconfig.json stryker run path/to/your/stryker.conf.js
```
