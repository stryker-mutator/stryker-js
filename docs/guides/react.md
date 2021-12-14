---
title: React
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/guides/react.md
---

Stryker supports React projects using Jest with both JSX and TSX code.

## JSX project

Recommended stryker packages: `npm i -D @stryker-mutator/core @stryker-mutator/jest-runner`

Recommended other packages:

- jest 23.0.0 or higher

### Configuration

After installing the recommended packages, create the `stryker.conf.json` file in your repository.
The configuration below contains a good starting point for React projects.
You may have to change some paths like the [mutate](../configuration.md#mutate-string) array.

```json
{
  "testRunner": "jest",
  "jest": {
    "projectType": "create-react-app"
  }
}
```

## TSX projects

For projects using TypeScript and TSX, you can follow the JSX guide but with a few differences:

Recommended stryker packages: `npm i -D @stryker-mutator/core @stryker-mutator/jest-runner @stryker-mutator/typescript-checker`

Configuration:

```json
{
  "testRunner": "jest",
  "jest": {
    "projectType": "create-react-app"
  },
  "checkers": ["typescript"],
  "tsconfigFile": "tsconfig.json"
}
```

## Troubleshooting

Please take a look at the [troubleshooting page](../troubleshooting.md) when you run into any problems setting up StrykerJS.
