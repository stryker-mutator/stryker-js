# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)


### Bug Fixes

* **ArrowFunction mutator:** don't mutate () => undefined ([#2313](https://github.com/stryker-mutator/stryker/issues/2313)) ([310145e](https://github.com/stryker-mutator/stryker/commit/310145ec853a56b6520e0358861ba492b5dff0a6))
* **instrumenter:** don't mutate string literals in object properties ([#2354](https://github.com/stryker-mutator/stryker/issues/2354)) ([cd43952](https://github.com/stryker-mutator/stryker/commit/cd439522650fe59c1607d00d58d331b5dc45fe39))
* **mutator:** issue with block statement mutator ([#2342](https://github.com/stryker-mutator/stryker/issues/2342)) ([aaa4ff6](https://github.com/stryker-mutator/stryker/commit/aaa4ff6cd5bdfadef5047ec2c405ad0f385249ef)), closes [#2314](https://github.com/stryker-mutator/stryker/issues/2314)


### Features

* **command:** Support command test runner with mutation switching ([#2345](https://github.com/stryker-mutator/stryker/issues/2345)) ([59b1cfc](https://github.com/stryker-mutator/stryker/commit/59b1cfc06c4f8f5ec1e55dce4823e0f9c384b16c))
* **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))





# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/instrumenter





# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)


### Bug Fixes

* **instrumenter:** don't mutate `require` ([963e289](https://github.com/stryker-mutator/stryker/commit/963e28921c48ec2d4113ded0eefde7049fff3263))


### Features

* **core:** add support for checker plugins ([#2285](https://github.com/stryker-mutator/stryker/issues/2285)) ([69358e1](https://github.com/stryker-mutator/stryker/commit/69358e1423701c730e29d303119a08d74081f340))
* **html-parser:** add `// [@ts-nocheck](https://github.com/ts-nocheck)` to scripts ([8ceff31](https://github.com/stryker-mutator/stryker/commit/8ceff31aabda981551a5f5997e820fc9af76565d))
* **instrumenter:** add mutant placers ([#2224](https://github.com/stryker-mutator/stryker/issues/2224)) ([0e05025](https://github.com/stryker-mutator/stryker/commit/0e0502523a32ffbe836e93da9ade479b01393c5a))
* **instrumenter:** add parsers ([#2222](https://github.com/stryker-mutator/stryker/issues/2222)) ([3b57ef2](https://github.com/stryker-mutator/stryker/commit/3b57ef23dd5b348dcdff205600989aea2c7fbcf0))
* **instrumenter:** add the mutation testing instrumenter ([#2212](https://github.com/stryker-mutator/stryker/issues/2212)) ([197e177](https://github.com/stryker-mutator/stryker/commit/197e177cb730952b22d3e5929f4799c2bae476d7))
* **instrumenter:** add transformers ([#2234](https://github.com/stryker-mutator/stryker/issues/2234)) ([61c8fe6](https://github.com/stryker-mutator/stryker/commit/61c8fe65e35bb95b786a0e2bebbe57166ffbc480))
* **instrumenter:** allow override of babel plugins ([8758cfd](https://github.com/stryker-mutator/stryker/commit/8758cfdda8ac2bfa761568f55ddee48c2a23f0e0))
* **instrumenter:** implement `Instrumenter` class ([8df9172](https://github.com/stryker-mutator/stryker/commit/8df9172b95b6e277f44302469edb3c00324a02bd))
* **mutators:** add mutators to instrumenter package ([#2266](https://github.com/stryker-mutator/stryker/issues/2266)) ([3b87743](https://github.com/stryker-mutator/stryker/commit/3b87743645db9923d4c85146ea861aa1b7265447))


### BREAKING CHANGES

* **core:** * `--maxConcurrentTestRunners` is now deprecated. Please use `--concurrency` instead.
