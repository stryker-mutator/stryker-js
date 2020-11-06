# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

**Note:** Version bump only for package @stryker-mutator/instrumenter





## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)


### Bug Fixes

* **disable-checking:** allow jest environment ([#2607](https://github.com/stryker-mutator/stryker/issues/2607)) ([26aca66](https://github.com/stryker-mutator/stryker/commit/26aca661dcf02efc7d0d57408d45a02d2a5a4b82))
* **ts:** support es private fields ([#2605](https://github.com/stryker-mutator/stryker/issues/2605)) ([6bd2fbb](https://github.com/stryker-mutator/stryker/commit/6bd2fbbf0aaa5154930ce36f4d153ee91a3c5f1f))





# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)


### Bug Fixes

* **instrumenter:** add missing case for .jsx files in parser ([#2577](https://github.com/stryker-mutator/stryker/issues/2577)) ([cea94aa](https://github.com/stryker-mutator/stryker/commit/cea94aa90347ab1ff601205014116d41a6bef3f9))
* **string-literal-mutator:** don't mutate class property keys ([#2544](https://github.com/stryker-mutator/stryker/issues/2544)) ([8c8b478](https://github.com/stryker-mutator/stryker/commit/8c8b47819a6f415c0da773888ed7692cf5d76776))


### Features

* **instrumenter:** update to babel 7.12 ([#2592](https://github.com/stryker-mutator/stryker/issues/2592)) ([300b73f](https://github.com/stryker-mutator/stryker/commit/300b73f60dde87b8780341d1ac6d2d6ab5aeb69e))





# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)


### Bug Fixes

* **instrumenter:** don't mutate generics ([#2530](https://github.com/stryker-mutator/stryker/issues/2530)) ([ed42e3c](https://github.com/stryker-mutator/stryker/commit/ed42e3c222a7bd0f98090a77cfee08db366679a1))





# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)


### Bug Fixes

* **instrumenter:** switch case mutant placer ([#2518](https://github.com/stryker-mutator/stryker/issues/2518)) ([a560711](https://github.com/stryker-mutator/stryker/commit/a560711023990dca950700da18269e78249b5c49))


### Features

* **instrumenter:** add excludedMutations support ([#2513](https://github.com/stryker-mutator/stryker/issues/2513)) ([bfd714f](https://github.com/stryker-mutator/stryker/commit/bfd714fe1b4f9c3b2468164a95d0c5bd0cbc8fcf))





# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)


### Bug Fixes

* **instrumenter:** only add header when there are mutats ([#2503](https://github.com/stryker-mutator/stryker/issues/2503)) ([8f989cc](https://github.com/stryker-mutator/stryker/commit/8f989cceb8fea5e66e3055a623f238ce85ef1025))
* **shebang:** support shebang in in files ([#2510](https://github.com/stryker-mutator/stryker/issues/2510)) ([7d2dd80](https://github.com/stryker-mutator/stryker/commit/7d2dd80f2c7a89f31c8f96c2e911a6f9beaf7cbc))





# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)


### Bug Fixes

* **instrumenter:** ignore `declare` syntax ([b1faa16](https://github.com/stryker-mutator/stryker/commit/b1faa1603f68dded5d694cdb41b6e75b05ac9e1a))


### Features

* **instrumenter:** improve placement error ([12e097e](https://github.com/stryker-mutator/stryker/commit/12e097e287d24e41656d2b3897335b3f93654e5d))





# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)


### Bug Fixes

* **instrumenter:** don't mutate constructor blocks with initialized class properties ([#2484](https://github.com/stryker-mutator/stryker/issues/2484)) ([ca464a3](https://github.com/stryker-mutator/stryker/commit/ca464a31e180aada677464591154c41295fbc50c)), closes [#2474](https://github.com/stryker-mutator/stryker/issues/2474)
* **instrumenter:** place mutants in if statements  ([#2481](https://github.com/stryker-mutator/stryker/issues/2481)) ([4df4102](https://github.com/stryker-mutator/stryker/commit/4df410263be09468323d7f64d95a8a839432e52f)), closes [#2469](https://github.com/stryker-mutator/stryker/issues/2469)





# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)


### Bug Fixes

* **instrumenter:** skip `as` expressions ([#2471](https://github.com/stryker-mutator/stryker/issues/2471)) ([2432d84](https://github.com/stryker-mutator/stryker/commit/2432d8442bd783448568a92c57349ecab626def0))





# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)


### Bug Fixes

* **mocha-runner:** don't allow custom timeout ([#2463](https://github.com/stryker-mutator/stryker/issues/2463)) ([e90b563](https://github.com/stryker-mutator/stryker/commit/e90b5635907dfcd36de98d73fa6c2da31f69fbed))


### Features

* **typescript:** Disable type checking ([#2446](https://github.com/stryker-mutator/stryker/issues/2446)) ([3ff996b](https://github.com/stryker-mutator/stryker/commit/3ff996b7516b7782434d86aa9aecbee334978a7f)), closes [#2438](https://github.com/stryker-mutator/stryker/issues/2438)





# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

**Note:** Version bump only for package @stryker-mutator/instrumenter





# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)


### Bug Fixes

* **instrumenter:** support anonymous function names ([#2388](https://github.com/stryker-mutator/stryker/issues/2388)) ([c7d150a](https://github.com/stryker-mutator/stryker/commit/c7d150ab1af4341bb59381ef55fa54eff0113a11)), closes [#2362](https://github.com/stryker-mutator/stryker/issues/2362)


### Features

* **core:** strip comments in sandbox ([#2365](https://github.com/stryker-mutator/stryker/issues/2365)) ([55f27f2](https://github.com/stryker-mutator/stryker/commit/55f27f29b6994096c9aad038958ee93e9fa0f035)), closes [#2364](https://github.com/stryker-mutator/stryker/issues/2364)
* **instrumenter:** add support for `.mjs` and `.cjs` file formats ([#2391](https://github.com/stryker-mutator/stryker/issues/2391)) ([5ba4c5c](https://github.com/stryker-mutator/stryker/commit/5ba4c5c93a721982019aa7e124e491decec2e9f0))





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
