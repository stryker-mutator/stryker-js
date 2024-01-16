# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.0.0](https://github.com/stryker-mutator/stryker-js/compare/v7.3.0...v8.0.0) (2023-11-30)

### Bug Fixes

- **deps:** update dependency angular-html-parser to v5 ([#4533](https://github.com/stryker-mutator/stryker-js/issues/4533)) ([fb5a167](https://github.com/stryker-mutator/stryker-js/commit/fb5a1671304b007ee3c6a85f11415d36257f6122))

### Features

- **node:** drop official support for node 16 ([#4542](https://github.com/stryker-mutator/stryker-js/issues/4542)) ([e190207](https://github.com/stryker-mutator/stryker-js/commit/e190207e25926179c1a3ed2c0ff97a13720c57bd))
- **svelte:** support mutating `.svelte` files ([0ef9a7f](https://github.com/stryker-mutator/stryker-js/commit/0ef9a7f5045799c39f7c6312c73a8d0345236615))

### BREAKING CHANGES

- **node:** NodeJS 16 is no longer supported. Please use NodeJS 18 or higher. See https://nodejs.org/en/about/previous-releases

# [7.3.0](https://github.com/stryker-mutator/stryker-js/compare/v7.2.0...v7.3.0) (2023-10-15)

### Bug Fixes

- **package:** don't publish test and tsbuildinfo. ([#4464](https://github.com/stryker-mutator/stryker-js/issues/4464)) ([ae3d2d8](https://github.com/stryker-mutator/stryker-js/commit/ae3d2d8f6bd92be73dface5cc7e08589872a4d60))

### Features

- **Ignorer plugin:** support ignorer plugins ([#4487](https://github.com/stryker-mutator/stryker-js/issues/4487)) ([4fe1000](https://github.com/stryker-mutator/stryker-js/commit/4fe10004881e8a46ca6ac32d957b069c70910686))
- **plugin:** add support for `declareValuePlugin` ([#4490](https://github.com/stryker-mutator/stryker-js/issues/4490)) ([a3c35ca](https://github.com/stryker-mutator/stryker-js/commit/a3c35caa3b2dba7036e1ebf081c74fa594f88d03))

# [7.2.0](https://github.com/stryker-mutator/stryker-js/compare/v7.1.1...v7.2.0) (2023-10-02)

### Bug Fixes

- **npm package:** ignore unused files ([#4405](https://github.com/stryker-mutator/stryker-js/issues/4405)) ([f14e789](https://github.com/stryker-mutator/stryker-js/commit/f14e78944652ceccd205ca1541465292e758c565))

### Features

- **string mutations:** don't mutate Symbol descriptions ([#4407](https://github.com/stryker-mutator/stryker-js/issues/4407)) ([bdd0d5c](https://github.com/stryker-mutator/stryker-js/commit/bdd0d5c96c51371f347c06d66555ff255aaf3a6e))

## [7.1.1](https://github.com/stryker-mutator/stryker-js/compare/v7.1.0...v7.1.1) (2023-07-15)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [7.1.0](https://github.com/stryker-mutator/stryker-js/compare/v7.0.2...v7.1.0) (2023-06-24)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [7.0.1](https://github.com/stryker-mutator/stryker-js/compare/v7.0.0...v7.0.1) (2023-06-03)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [7.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.4.2...v7.0.0) (2023-06-02)

### Bug Fixes

- **deps:** update babel monorepo ([#4233](https://github.com/stryker-mutator/stryker-js/issues/4233)) ([a8f2c1e](https://github.com/stryker-mutator/stryker-js/commit/a8f2c1e364a611982a2c3f12b6be32a4a2f2ffec))
- **deps:** update dependency weapon-regex to ~1.1.0 ([#4102](https://github.com/stryker-mutator/stryker-js/issues/4102)) ([899ae6e](https://github.com/stryker-mutator/stryker-js/commit/899ae6effae0fd4cf9cec3b71a7c75e078005082))
- **instrumenter:** Use `globalThis` when available ([#4169](https://github.com/stryker-mutator/stryker-js/issues/4169)) ([7d1e58e](https://github.com/stryker-mutator/stryker-js/commit/7d1e58eb150237c102c3a3a7ad0044e5031ce07e))

### chore

- **esm:** use "exports" and module "Node16" ([#4171](https://github.com/stryker-mutator/stryker-js/issues/4171)) ([cdf4a34](https://github.com/stryker-mutator/stryker-js/commit/cdf4a342b73d922423eb46a919eb3b38c4c43c46))

### Features

- **mutations:** add Math method expression mutants ([#4076](https://github.com/stryker-mutator/stryker-js/issues/4076)) ([b281163](https://github.com/stryker-mutator/stryker-js/commit/b28116359eb1557fa157a296d04105b3751d1a69))
- **node:** Drop support for node 14 ([#4105](https://github.com/stryker-mutator/stryker-js/issues/4105)) ([a88744f](https://github.com/stryker-mutator/stryker-js/commit/a88744f1a5fa47274ee0f30abc635831b18113fa))

### BREAKING CHANGES

- **esm:** Deep (and undocumented) imports from `@stryker-mutator/core` or one of the plugins will no longer work. If you want to import something that's not available, please let us know by [opening an issue](https://github.com/stryker-mutator/stryker-js/issues/new/choose)
- **node:** Node 14 is no longer supported. Please install an LTS version of node: nodejs.org/

## [6.4.2](https://github.com/stryker-mutator/stryker-js/compare/v6.4.1...v6.4.2) (2023-03-24)

### Bug Fixes

- **instrumenter:** replace deprecated method call ([#4023](https://github.com/stryker-mutator/stryker-js/issues/4023)) ([c14800a](https://github.com/stryker-mutator/stryker-js/commit/c14800aa58add9cea6c2bd8700c21507a381cb8a))

## [6.4.1](https://github.com/stryker-mutator/stryker-js/compare/v6.4.0...v6.4.1) (2023-02-17)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [6.4.0](https://github.com/stryker-mutator/stryker-js/compare/v6.3.1...v6.4.0) (2023-02-17)

### Bug Fixes

- **deps:** update dependency angular-html-parser to v4 ([#3925](https://github.com/stryker-mutator/stryker-js/issues/3925)) ([f62c645](https://github.com/stryker-mutator/stryker-js/commit/f62c645f22a2cb5b3d87f5ffad7139db8367fe8c))

## [6.3.1](https://github.com/stryker-mutator/stryker-js/compare/v6.3.0...v6.3.1) (2022-12-18)

### Bug Fixes

- **deps:** update babel monorepo to ~7.20.0 ([#3810](https://github.com/stryker-mutator/stryker-js/issues/3810)) ([cd1c962](https://github.com/stryker-mutator/stryker-js/commit/cd1c96264fd52ff97182a1d0bc044401e7807044))
- **deps:** update dependency angular-html-parser to v3 ([#3869](https://github.com/stryker-mutator/stryker-js/issues/3869)) ([39d6381](https://github.com/stryker-mutator/stryker-js/commit/39d6381c9c347edc66b27c1009bb406d89018b1b))
- **disable-comment:** log a warning when a specified mutator doesn't exist([#3842](https://github.com/stryker-mutator/stryker-js/issues/3842)) ([fe79d49](https://github.com/stryker-mutator/stryker-js/commit/fe79d49cbdf414bce007799c8930ec3a506fed6c))

# [6.3.0](https://github.com/stryker-mutator/stryker-js/compare/v6.2.3...v6.3.0) (2022-10-30)

### Bug Fixes

- **deps:** update dependency angular-html-parser to ~2.1.0 ([#3797](https://github.com/stryker-mutator/stryker-js/issues/3797)) ([33eb2b1](https://github.com/stryker-mutator/stryker-js/commit/33eb2b1e2cb5915ea85ec02fe2a9e41b6f58d8d0))

### Features

- **ci:** forbid `.only` in CI pipeline tests ([#3823](https://github.com/stryker-mutator/stryker-js/issues/3823)) ([051ec93](https://github.com/stryker-mutator/stryker-js/commit/051ec937809468751a74c9e01cacd27ceb1acca2))
- **disableTypeChecks:** add option 'true' to disable all type checks ([#3765](https://github.com/stryker-mutator/stryker-js/issues/3765)) ([3c3d298](https://github.com/stryker-mutator/stryker-js/commit/3c3d2988c616a8bb8e7cdb76d4c16ddb948a3011))

## [6.2.3](https://github.com/stryker-mutator/stryker-js/compare/v6.2.2...v6.2.3) (2022-10-10)

### Bug Fixes

- **deps:** update dependency angular-html-parser to v2 ([#3760](https://github.com/stryker-mutator/stryker-js/issues/3760)) ([8dc667e](https://github.com/stryker-mutator/stryker-js/commit/8dc667e203a02a4bb4a4addbaed9053ff275c7f6))

## [6.2.2](https://github.com/stryker-mutator/stryker-js/compare/v6.2.1...v6.2.2) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [6.2.1](https://github.com/stryker-mutator/stryker-js/compare/v6.2.0...v6.2.1) (2022-09-06)

### Bug Fixes

- **mutant-placing:** regression in optional chain ([#3718](https://github.com/stryker-mutator/stryker-js/issues/3718)) ([1228619](https://github.com/stryker-mutator/stryker-js/commit/1228619afd85449e35c466a75d71bb94636f091e))

# [6.2.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0) (2022-09-06)

### Bug Fixes

- **deps:** update babel monorepo to ~7.19.0 ([#3716](https://github.com/stryker-mutator/stryker-js/issues/3716)) ([edc1ae0](https://github.com/stryker-mutator/stryker-js/commit/edc1ae0644c320ca8dda58686f0b02b5ca0cb908))
- **mutant placing:** computed member expressions ([#3713](https://github.com/stryker-mutator/stryker-js/issues/3713)) ([e6ee245](https://github.com/stryker-mutator/stryker-js/commit/e6ee245120252d1294deb8c5aa3e7df20e5249a5))
- **regex:** support unicode regex flags([#3642](https://github.com/stryker-mutator/stryker-js/issues/3642)) ([fcf3a6b](https://github.com/stryker-mutator/stryker-js/commit/fcf3a6beb852dddec2c4f3e32ed72dd4fcb4cd98)), closes [#3579](https://github.com/stryker-mutator/stryker-js/issues/3579)

### Features

- **incremental:** add incremental mode ([#3609](https://github.com/stryker-mutator/stryker-js/issues/3609)) ([82bea56](https://github.com/stryker-mutator/stryker-js/commit/82bea5604c81c1ccf76d44827ad3922cfb61463b))

# [6.2.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0-beta.0) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [6.1.2](https://github.com/stryker-mutator/stryker-js/compare/v6.1.1...v6.1.2) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [6.1.1](https://github.com/stryker-mutator/stryker-js/compare/v6.1.0...v6.1.1) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [6.1.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.2...v6.1.0) (2022-06-27)

### Features

- **mutators:** Add method expression mutator ([#3508](https://github.com/stryker-mutator/stryker-js/issues/3508)) ([70a4e4f](https://github.com/stryker-mutator/stryker-js/commit/70a4e4f092b47c018ed1877d9011c7dbd7fdc5b2))
- **plugin:** allow fileDescriptions to be injected ([#3582](https://github.com/stryker-mutator/stryker-js/issues/3582)) ([fa2b77e](https://github.com/stryker-mutator/stryker-js/commit/fa2b77e3572884f44329e3f03b9201e9fd37082c))

## [6.0.2](https://github.com/stryker-mutator/stryker-js/compare/v6.0.1...v6.0.2) (2022-05-05)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [6.0.1](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0...v6.0.1) (2022-05-04)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [6.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0-beta.0...v6.0.0) (2022-05-03)

### chore

- **node:** drop support for Node 12 ([10d874e](https://github.com/stryker-mutator/stryker-js/commit/10d874e4c46335d9ea457634d3061af35fa8f854))

### Code Refactoring

- **file:** move `File` from `api` to `util` ([#3489](https://github.com/stryker-mutator/stryker-js/issues/3489)) ([ac4bcca](https://github.com/stryker-mutator/stryker-js/commit/ac4bcca133930a046e0abf28abad24a5af1dbd22))

### Features

- **react:** support react 18 projects by default ([#3491](https://github.com/stryker-mutator/stryker-js/issues/3491)) ([82d9bce](https://github.com/stryker-mutator/stryker-js/commit/82d9bce0f351ce8b0c852684665bcec129846ee3))

### BREAKING CHANGES

- **file:** The `File` class is no longer part of the public api and is thus no longer exported from `@stryker-mutator/api`. Plugin creators shouldn't rely on it anymore.
- **node:** Drop support for Node 12. Minimal version is now Node 14.18.0.

# [6.0.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v5.6.1...v6.0.0-beta.0) (2022-03-02)

### Features

- **esm config:** support config file as pure esm ([#3432](https://github.com/stryker-mutator/stryker-js/issues/3432)) ([309a7e2](https://github.com/stryker-mutator/stryker-js/commit/309a7e2807e454a82f177de781bc4908f87c739b))
- **esm:** migrate StrykerJS to pure ESM ([#3409](https://github.com/stryker-mutator/stryker-js/issues/3409)) ([78c305e](https://github.com/stryker-mutator/stryker-js/commit/78c305e2c2271fedb54bfff3d34aa6b70b421b3a))

### BREAKING CHANGES

- **esm config:** Exporting a function (using `module.exports = function(config) {}`) from your `stryker.conf.js` file is no longer supported. This was already deprecated but now will give an error.
- **esm:** StrykerJS is now a pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **esm:** Node 12.20 is now the min version.
- **esm:** Karma v6.3 is now the min supported karma version for `@stryker-mutator/karma-runner`, since [that version added support for async config loading](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23)

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

### Bug Fixes

- **mutators:** avoid creating some unnecessary mutations ([#3346](https://github.com/stryker-mutator/stryker-js/issues/3346)) ([0f60ecf](https://github.com/stryker-mutator/stryker-js/commit/0f60ecf2159490d6fa411ea3fa0c3a091fcdd8fa))

# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

### Bug Fixes

- **instrumenter:** don't mutate TS generics ([#3268](https://github.com/stryker-mutator/stryker-js/issues/3268)) ([88d6eaf](https://github.com/stryker-mutator/stryker-js/commit/88d6eaff7b9ffab7f45c76e8f348a131798f7671))

### Features

- **mutators:** Implement missing AssignmentOperatorMutator ([#3203](https://github.com/stryker-mutator/stryker-js/issues/3203)) ([95b694b](https://github.com/stryker-mutator/stryker-js/commit/95b694b89430af58ec085bea07883372976fbb02))

## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

### Bug Fixes

- **instrumenter:** don't break optional chains([#3156](https://github.com/stryker-mutator/stryker-js/issues/3156)) ([95e6b69](https://github.com/stryker-mutator/stryker-js/commit/95e6b69d3267bbda9fdd1ef60350993e05a7dbe7))

# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

### Features

- **ignore:** support disable directives in source code ([#3072](https://github.com/stryker-mutator/stryker-js/issues/3072)) ([701d8b3](https://github.com/stryker-mutator/stryker-js/commit/701d8b348e2e529e9352d546fab246815e1d7a9a))

# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

### Features

- **hit limit:** infinite loop prevention in karma-runner ([#3031](https://github.com/stryker-mutator/stryker-js/issues/3031)) ([fc732fc](https://github.com/stryker-mutator/stryker-js/commit/fc732fce8838c96be2fdf37aff69b12c996d7cb0))

## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

### Features

- **mutator:** add the optional chaining mutator ([#2988](https://github.com/stryker-mutator/stryker-js/issues/2988)) ([43ac767](https://github.com/stryker-mutator/stryker-js/commit/43ac76774d9f5b2bca3f56f99a88f341d6027027))

# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

### Features

- **instrumenter:** Implement new mutant placing algorithm ([#2964](https://github.com/stryker-mutator/stryker-js/issues/2964)) ([24b8bc9](https://github.com/stryker-mutator/stryker-js/commit/24b8bc9a15f597d3c5b626dd282d9ecda57f9b32))

## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)

### Bug Fixes

- **vue-tsx:** support parsing tsx script in .vue file ([#2850](https://github.com/stryker-mutator/stryker-js/issues/2850)) ([dc66c28](https://github.com/stryker-mutator/stryker-js/commit/dc66c28999a548c3c1837dc10d4d38033ae36b1b))

### Features

- **es:** convert to es2019 ([#2846](https://github.com/stryker-mutator/stryker-js/issues/2846)) ([36c687f](https://github.com/stryker-mutator/stryker-js/commit/36c687fd5735e63502db0ad8b8a302f978cd8027))
- **mutators:** mutate nullish coalescing operator ([#2884](https://github.com/stryker-mutator/stryker-js/issues/2884)) ([021a419](https://github.com/stryker-mutator/stryker-js/commit/021a4193232318155139ad5df68bf74748fc112c))
- **node:** Drop support for node 10 ([#2879](https://github.com/stryker-mutator/stryker-js/issues/2879)) ([dd29f88](https://github.com/stryker-mutator/stryker-js/commit/dd29f883d384fd29b86a0ef9f78808975657a001))
- **range:** remove Range from the API ([#2882](https://github.com/stryker-mutator/stryker-js/issues/2882)) ([b578b22](https://github.com/stryker-mutator/stryker-js/commit/b578b22eb9ccdd023602573d5d6e52c49bf99e0f)), closes [#322](https://github.com/stryker-mutator/stryker-js/issues/322)
- **reporter api:** unify reporter api with mutation-testing-elements ([#2798](https://github.com/stryker-mutator/stryker-js/issues/2798)) ([d173b27](https://github.com/stryker-mutator/stryker-js/commit/d173b27117ade43e86a991643207532e338e7907)), closes [#2766](https://github.com/stryker-mutator/stryker-js/issues/2766)

### BREAKING CHANGES

- **range:** The `range` property is no longer present on a `mutant`. Note, this is a breaking change for plugin creators only.

Co-authored-by: Simon de Lang <simondelang@gmail.com>

- **node:** Node 10 is no longer supported. Please use Node 12 or higher.
- **reporter api:** Changes to `Reporter` and `TestRunner` plugin API of Stryker

# [4.6.0](https://github.com/stryker-mutator/stryker-js/compare/v4.5.1...v4.6.0) (2021-04-16)

### Features

- **mutation range:** allow specifying a mutation range ([#2751](https://github.com/stryker-mutator/stryker-js/issues/2751)) ([84647cf](https://github.com/stryker-mutator/stryker-js/commit/84647cf8c4052dead95d4d23a0e9c0c66e54292c))
- **rename:** rename to StrykerJS ([#2813](https://github.com/stryker-mutator/stryker-js/issues/2813)) ([dc08592](https://github.com/stryker-mutator/stryker-js/commit/dc08592c09c0fe5fcc21db03dc2da4e03713f46b)), closes [#2754](https://github.com/stryker-mutator/stryker-js/issues/2754)

## [4.5.1](https://github.com/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)

### Bug Fixes

- **babel-transformer:** respect top of the file comments/pragma ([#2783](https://github.com/stryker-mutator/stryker/issues/2783)) ([ca42276](https://github.com/stryker-mutator/stryker/commit/ca422764a2ba5552ef34965532e0b9030f110669))
- **instrumenter:** corect mutant location in .vue and .html files ([547a25c](https://github.com/stryker-mutator/stryker/commit/547a25cfa13e89a597c433bb329ee011abe84420)), closes [#2790](https://github.com/stryker-mutator/stryker/issues/2790)

# [4.5.0](https://github.com/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)

### Bug Fixes

- **mutator:** don't mutate string literal object methods ([#2718](https://github.com/stryker-mutator/stryker/issues/2718)) ([964537a](https://github.com/stryker-mutator/stryker/commit/964537a37dece036573f88bace6c714a0413a2e7))

### Features

- **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))

## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

### Features

- **regex-mutator:** smart regex mutations ([#2709](https://github.com/stryker-mutator/stryker/issues/2709)) ([0877f44](https://github.com/stryker-mutator/stryker/commit/0877f443219a29c34ac13ca27f33cbf884b5bb4b))

## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

### Bug Fixes

- **arithmatic-mutator:** Don't mutate obvious string concat ([#2648](https://github.com/stryker-mutator/stryker/issues/2648)) ([71f8f9a](https://github.com/stryker-mutator/stryker/commit/71f8f9a6f4f663942c83d64667058d1de3d958a6))

## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

**Note:** Version bump only for package @stryker-mutator/instrumenter

## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

### Bug Fixes

- **disable-checking:** allow jest environment ([#2607](https://github.com/stryker-mutator/stryker/issues/2607)) ([26aca66](https://github.com/stryker-mutator/stryker/commit/26aca661dcf02efc7d0d57408d45a02d2a5a4b82))
- **ts:** support es private fields ([#2605](https://github.com/stryker-mutator/stryker/issues/2605)) ([6bd2fbb](https://github.com/stryker-mutator/stryker/commit/6bd2fbbf0aaa5154930ce36f4d153ee91a3c5f1f))

# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

### Bug Fixes

- **instrumenter:** add missing case for .jsx files in parser ([#2577](https://github.com/stryker-mutator/stryker/issues/2577)) ([cea94aa](https://github.com/stryker-mutator/stryker/commit/cea94aa90347ab1ff601205014116d41a6bef3f9))
- **string-literal-mutator:** don't mutate class property keys ([#2544](https://github.com/stryker-mutator/stryker/issues/2544)) ([8c8b478](https://github.com/stryker-mutator/stryker/commit/8c8b47819a6f415c0da773888ed7692cf5d76776))

### Features

- **instrumenter:** update to babel 7.12 ([#2592](https://github.com/stryker-mutator/stryker/issues/2592)) ([300b73f](https://github.com/stryker-mutator/stryker/commit/300b73f60dde87b8780341d1ac6d2d6ab5aeb69e))

# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

### Bug Fixes

- **instrumenter:** don't mutate generics ([#2530](https://github.com/stryker-mutator/stryker/issues/2530)) ([ed42e3c](https://github.com/stryker-mutator/stryker/commit/ed42e3c222a7bd0f98090a77cfee08db366679a1))

# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

### Bug Fixes

- **instrumenter:** switch case mutant placer ([#2518](https://github.com/stryker-mutator/stryker/issues/2518)) ([a560711](https://github.com/stryker-mutator/stryker/commit/a560711023990dca950700da18269e78249b5c49))

### Features

- **instrumenter:** add excludedMutations support ([#2513](https://github.com/stryker-mutator/stryker/issues/2513)) ([bfd714f](https://github.com/stryker-mutator/stryker/commit/bfd714fe1b4f9c3b2468164a95d0c5bd0cbc8fcf))

# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)

### Bug Fixes

- **instrumenter:** only add header when there are mutats ([#2503](https://github.com/stryker-mutator/stryker/issues/2503)) ([8f989cc](https://github.com/stryker-mutator/stryker/commit/8f989cceb8fea5e66e3055a623f238ce85ef1025))
- **shebang:** support shebang in in files ([#2510](https://github.com/stryker-mutator/stryker/issues/2510)) ([7d2dd80](https://github.com/stryker-mutator/stryker/commit/7d2dd80f2c7a89f31c8f96c2e911a6f9beaf7cbc))

# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

### Bug Fixes

- **instrumenter:** ignore `declare` syntax ([b1faa16](https://github.com/stryker-mutator/stryker/commit/b1faa1603f68dded5d694cdb41b6e75b05ac9e1a))

### Features

- **instrumenter:** improve placement error ([12e097e](https://github.com/stryker-mutator/stryker/commit/12e097e287d24e41656d2b3897335b3f93654e5d))

# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

### Bug Fixes

- **instrumenter:** don't mutate constructor blocks with initialized class properties ([#2484](https://github.com/stryker-mutator/stryker/issues/2484)) ([ca464a3](https://github.com/stryker-mutator/stryker/commit/ca464a31e180aada677464591154c41295fbc50c)), closes [#2474](https://github.com/stryker-mutator/stryker/issues/2474)
- **instrumenter:** place mutants in if statements ([#2481](https://github.com/stryker-mutator/stryker/issues/2481)) ([4df4102](https://github.com/stryker-mutator/stryker/commit/4df410263be09468323d7f64d95a8a839432e52f)), closes [#2469](https://github.com/stryker-mutator/stryker/issues/2469)

# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

### Bug Fixes

- **instrumenter:** skip `as` expressions ([#2471](https://github.com/stryker-mutator/stryker/issues/2471)) ([2432d84](https://github.com/stryker-mutator/stryker/commit/2432d8442bd783448568a92c57349ecab626def0))

# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

### Bug Fixes

- **mocha-runner:** don't allow custom timeout ([#2463](https://github.com/stryker-mutator/stryker/issues/2463)) ([e90b563](https://github.com/stryker-mutator/stryker/commit/e90b5635907dfcd36de98d73fa6c2da31f69fbed))

### Features

- **typescript:** Disable type checking ([#2446](https://github.com/stryker-mutator/stryker/issues/2446)) ([3ff996b](https://github.com/stryker-mutator/stryker/commit/3ff996b7516b7782434d86aa9aecbee334978a7f)), closes [#2438](https://github.com/stryker-mutator/stryker/issues/2438)

# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)

### Bug Fixes

- **instrumenter:** support anonymous function names ([#2388](https://github.com/stryker-mutator/stryker/issues/2388)) ([c7d150a](https://github.com/stryker-mutator/stryker/commit/c7d150ab1af4341bb59381ef55fa54eff0113a11)), closes [#2362](https://github.com/stryker-mutator/stryker/issues/2362)

### Features

- **core:** strip comments in sandbox ([#2365](https://github.com/stryker-mutator/stryker/issues/2365)) ([55f27f2](https://github.com/stryker-mutator/stryker/commit/55f27f29b6994096c9aad038958ee93e9fa0f035)), closes [#2364](https://github.com/stryker-mutator/stryker/issues/2364)
- **instrumenter:** add support for `.mjs` and `.cjs` file formats ([#2391](https://github.com/stryker-mutator/stryker/issues/2391)) ([5ba4c5c](https://github.com/stryker-mutator/stryker/commit/5ba4c5c93a721982019aa7e124e491decec2e9f0))

# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

### Bug Fixes

- **ArrowFunction mutator:** don't mutate () => undefined ([#2313](https://github.com/stryker-mutator/stryker/issues/2313)) ([310145e](https://github.com/stryker-mutator/stryker/commit/310145ec853a56b6520e0358861ba492b5dff0a6))
- **instrumenter:** don't mutate string literals in object properties ([#2354](https://github.com/stryker-mutator/stryker/issues/2354)) ([cd43952](https://github.com/stryker-mutator/stryker/commit/cd439522650fe59c1607d00d58d331b5dc45fe39))
- **mutator:** issue with block statement mutator ([#2342](https://github.com/stryker-mutator/stryker/issues/2342)) ([aaa4ff6](https://github.com/stryker-mutator/stryker/commit/aaa4ff6cd5bdfadef5047ec2c405ad0f385249ef)), closes [#2314](https://github.com/stryker-mutator/stryker/issues/2314)

### Features

- **command:** Support command test runner with mutation switching ([#2345](https://github.com/stryker-mutator/stryker/issues/2345)) ([59b1cfc](https://github.com/stryker-mutator/stryker/commit/59b1cfc06c4f8f5ec1e55dce4823e0f9c384b16c))
- **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))

# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/instrumenter

# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)

### Bug Fixes

- **instrumenter:** don't mutate `require` ([963e289](https://github.com/stryker-mutator/stryker/commit/963e28921c48ec2d4113ded0eefde7049fff3263))

### Features

- **core:** add support for checker plugins ([#2285](https://github.com/stryker-mutator/stryker/issues/2285)) ([69358e1](https://github.com/stryker-mutator/stryker/commit/69358e1423701c730e29d303119a08d74081f340))
- **html-parser:** add `// [@ts-nocheck](https://github.com/ts-nocheck)` to scripts ([8ceff31](https://github.com/stryker-mutator/stryker/commit/8ceff31aabda981551a5f5997e820fc9af76565d))
- **instrumenter:** add mutant placers ([#2224](https://github.com/stryker-mutator/stryker/issues/2224)) ([0e05025](https://github.com/stryker-mutator/stryker/commit/0e0502523a32ffbe836e93da9ade479b01393c5a))
- **instrumenter:** add parsers ([#2222](https://github.com/stryker-mutator/stryker/issues/2222)) ([3b57ef2](https://github.com/stryker-mutator/stryker/commit/3b57ef23dd5b348dcdff205600989aea2c7fbcf0))
- **instrumenter:** add the mutation testing instrumenter ([#2212](https://github.com/stryker-mutator/stryker/issues/2212)) ([197e177](https://github.com/stryker-mutator/stryker/commit/197e177cb730952b22d3e5929f4799c2bae476d7))
- **instrumenter:** add transformers ([#2234](https://github.com/stryker-mutator/stryker/issues/2234)) ([61c8fe6](https://github.com/stryker-mutator/stryker/commit/61c8fe65e35bb95b786a0e2bebbe57166ffbc480))
- **instrumenter:** allow override of babel plugins ([8758cfd](https://github.com/stryker-mutator/stryker/commit/8758cfdda8ac2bfa761568f55ddee48c2a23f0e0))
- **instrumenter:** implement `Instrumenter` class ([8df9172](https://github.com/stryker-mutator/stryker/commit/8df9172b95b6e277f44302469edb3c00324a02bd))
- **mutators:** add mutators to instrumenter package ([#2266](https://github.com/stryker-mutator/stryker/issues/2266)) ([3b87743](https://github.com/stryker-mutator/stryker/commit/3b87743645db9923d4c85146ea861aa1b7265447))

### BREAKING CHANGES

- **core:** \* `--maxConcurrentTestRunners` is now deprecated. Please use `--concurrency` instead.
