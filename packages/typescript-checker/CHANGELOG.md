# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)


### Bug Fixes

* **typescript-checker:** support empty files ([#2310](https://github.com/stryker-mutator/stryker/issues/2310)) ([284a28c](https://github.com/stryker-mutator/stryker/commit/284a28cbe831ad4c4ed161f2d700fa88663120ca))


### Features

* **core:** add support for checker plugins ([#2285](https://github.com/stryker-mutator/stryker/issues/2285)) ([69358e1](https://github.com/stryker-mutator/stryker/commit/69358e1423701c730e29d303119a08d74081f340))
* **tsconfig:** rewrite tsconfig references ([#2292](https://github.com/stryker-mutator/stryker/issues/2292)) ([4ee4950](https://github.com/stryker-mutator/stryker/commit/4ee4950bebd8db9c2f5a514edee57de55c040526)), closes [#2276](https://github.com/stryker-mutator/stryker/issues/2276)
* **typescript-checker:** a typescript type checker plugin ([#2241](https://github.com/stryker-mutator/stryker/issues/2241)) ([42adb95](https://github.com/stryker-mutator/stryker/commit/42adb9561cdd10172f955fda044854bcc1b7b515)), closes [/github.com/stryker-mutator/stryker/blob/f44008993a543dc3f38ca99516f56d315fdcb735/packages/typescript/src/transpiler/TranspilingLanguageService.ts#L23](https://github.com//github.com/stryker-mutator/stryker/blob/f44008993a543dc3f38ca99516f56d315fdcb735/packages/typescript/src/transpiler/TranspilingLanguageService.ts/issues/L23) [#391](https://github.com/stryker-mutator/stryker/issues/391)


### BREAKING CHANGES

* **core:** * `--maxConcurrentTestRunners` is now deprecated. Please use `--concurrency` instead.
