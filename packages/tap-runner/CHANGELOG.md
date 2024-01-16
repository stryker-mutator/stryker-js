# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.0.0](https://github.com/stryker-mutator/stryker-js/compare/v7.3.0...v8.0.0) (2023-11-30)

### Bug Fixes

- **deps:** update dependency tap-parser to ~15.3.0 ([#4492](https://github.com/stryker-mutator/stryker-js/issues/4492)) ([5ababb3](https://github.com/stryker-mutator/stryker-js/commit/5ababb3dc68eff28d38ff09c3d46cd10453a3dff))

# [7.3.0](https://github.com/stryker-mutator/stryker-js/compare/v7.2.0...v7.3.0) (2023-10-15)

### Bug Fixes

- **deps:** update dependency tap-parser to v15 ([#4457](https://github.com/stryker-mutator/stryker-js/issues/4457)) ([f3f16c3](https://github.com/stryker-mutator/stryker-js/commit/f3f16c3848f37e87a8bdbfe23a8af7acdd016253))
- **package:** don't publish test and tsbuildinfo. ([#4464](https://github.com/stryker-mutator/stryker-js/issues/4464)) ([ae3d2d8](https://github.com/stryker-mutator/stryker-js/commit/ae3d2d8f6bd92be73dface5cc7e08589872a4d60))

# [7.2.0](https://github.com/stryker-mutator/stryker-js/compare/v7.1.1...v7.2.0) (2023-10-02)

### Bug Fixes

- **npm package:** ignore unused files ([#4405](https://github.com/stryker-mutator/stryker-js/issues/4405)) ([f14e789](https://github.com/stryker-mutator/stryker-js/commit/f14e78944652ceccd205ca1541465292e758c565))

## [7.1.1](https://github.com/stryker-mutator/stryker-js/compare/v7.1.0...v7.1.1) (2023-07-15)

### Bug Fixes

- **deps:** update dependency tslib to v2.6.0 ([#4335](https://github.com/stryker-mutator/stryker-js/issues/4335)) ([e4c00ef](https://github.com/stryker-mutator/stryker-js/commit/e4c00ef9cddcc72b1bf0df5f10893933caaed7ef))
- **tap:** use custom time spent logic as fallback ([#4358](https://github.com/stryker-mutator/stryker-js/issues/4358)) ([354a660](https://github.com/stryker-mutator/stryker-js/commit/354a660a5b3eebfe4f84029f26e31dbe223f2bf5))

# [7.1.0](https://github.com/stryker-mutator/stryker-js/compare/v7.0.2...v7.1.0) (2023-06-24)

### Bug Fixes

- **deps:** update dependency glob to v10.3.0 ([#4321](https://github.com/stryker-mutator/stryker-js/issues/4321)) ([72615b6](https://github.com/stryker-mutator/stryker-js/commit/72615b66517ab053df040a6cfbecc20da478e8b6))

### Features

- **tap-runner:** add forceBail configuration option ([#4326](https://github.com/stryker-mutator/stryker-js/issues/4326)) ([55a5357](https://github.com/stryker-mutator/stryker-js/commit/55a5357b4f6f1973123eed73fe0465cf3abd3d14))
- **tap-runner:** allow custom node arguments ([#4283](https://github.com/stryker-mutator/stryker-js/issues/4283)) ([5ef0edd](https://github.com/stryker-mutator/stryker-js/commit/5ef0edd2ccf3d409e8c5d0747edd09071de43f09))

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

### Bug Fixes

- **tap:** log command to run on debug ([#4263](https://github.com/stryker-mutator/stryker-js/issues/4263)) ([dd8b53d](https://github.com/stryker-mutator/stryker-js/commit/dd8b53db86dac08bcc01d6851c7df1554579f6c6))

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
