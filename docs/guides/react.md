---
title: React
custom_edit_url: https://github.com/stryker-mutator/stryker4s/edit/master/docs/guides/react.md
---

Stryker supports React projects using Jest with both JSX and TSX code.

## JSX project

Recommended stryker packages: `npm i -D @stryker-mutator/core @stryker-mutator/jest-runner @stryker-mutator/javascript-mutator @stryker-mutator/html-reporter`

Recommended other packages:

- jest 23.0.0 or higher

### Configuration

After installing the recommended packages, create the `stryker.conf.js` file in your repository.
The configuration below contains a good starting point for React projects.
You may have to change some paths like the mutate array.

Coverage analysis is unfortunately not supported as of right now.

```js
module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.js?(x)', '!src/**/*@(.test|.spec|Spec).js?(x)'],
    mutator: 'javascript',
    testRunner: 'jest',
    reporter: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off',
    jest: {
      project: 'react',
    },
  });
};
```

## TSX projects

For projects using TypeScript and TSX, you can follow the JSX guide but with a few differences:

Recommended stryker packages: `npm i -D @stryker-mutator/core @stryker-mutator/jest-runner @stryker-mutator/typescript @stryker-mutator/html-reporter`

Configuration:

```js
mutate: ['src/**/*.ts?(x)', '!src/**/*@(.test|.spec|Spec).ts?(x)'],
mutator: 'typescript',
```
