# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.0.1](https://github.com/stryker-mutator/stryker-js/compare/v7.0.0...v7.0.1) (2023-06-03)

### Bug Fixes

- **deps:** update `@stryker-mutator/core` peer dep ([9dd4a76](https://github.com/stryker-mutator/stryker-js/commit/9dd4a767d30830861a3e997266a6491fae799acd))

# [7.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.4.2...v7.0.0) (2023-06-02)

### Bug Fixes

- **deps:** update dependency tap-parser to v13 ([#4116](https://github.com/stryker-mutator/stryker-js/issues/4116)) ([161f099](https://github.com/stryker-mutator/stryker-js/commit/161f0993ca20a25619e262969deb1cd27633d0d4))
- **deps:** update dependency tslib to v2.5.2 ([#4241](https://github.com/stryker-mutator/stryker-js/issues/4241)) ([4cd2a86](https://github.com/stryker-mutator/stryker-js/commit/4cd2a86503a243fd2998bc72245b8bda00d30d49))
- **tap-runner:** add `glob` as a dependency ([#4225](https://github.com/stryker-mutator/stryker-js/issues/4225)) ([ba6bb7e](https://github.com/stryker-mutator/stryker-js/commit/ba6bb7ebc02e1f08c4f4fa29af0961555ead6510))

### chore

- **esm:** use "exports" and module "Node16" ([#4171](https://github.com/stryker-mutator/stryker-js/issues/4171)) ([cdf4a34](https://github.com/stryker-mutator/stryker-js/commit/cdf4a342b73d922423eb46a919eb3b38c4c43c46))

### Features

- **TAP runner:** add support for the node TAP runner ([371baf0](https://github.com/stryker-mutator/stryker-js/commit/371baf07fe8fd47935829c8a38ddc50861614ee4))
- **tap-runner:** support `"nodeArgs"` ([#4235](https://github.com/stryker-mutator/stryker-js/issues/4235)) ([c149b34](https://github.com/stryker-mutator/stryker-js/commit/c149b346ec0e5146dd303cbda245ce7827aef5e2))
- **tap:** allow multiple patterns for `testFiles` ([#4253](https://github.com/stryker-mutator/stryker-js/issues/4253)) ([76b53f1](https://github.com/stryker-mutator/stryker-js/commit/76b53f122d8a8c65fc2f4037171656f22ac2a64b))

### BREAKING CHANGES

- **esm:** Deep (and undocumented) imports from `@stryker-mutator/core` or one of the plugins will no longer work. If you want to import something that's not available, please let us know by [opening an issue](https://github.com/stryker-mutator/stryker-js/issues/new/choose)
