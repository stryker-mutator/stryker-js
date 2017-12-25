# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.8.1"></a>
## [0.8.1](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.8.0...stryker-typescript@0.8.1) (2017-12-21)




**Note:** Version bump only for package stryker-typescript

<a name="0.8.0"></a>
# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.7.1...stryker-typescript@0.8.0) (2017-12-07)


### Features

* **typescript:** Backport to TS2.4 ([#544](https://github.com/stryker-mutator/stryker/issues/544)) ([88d7d0e](https://github.com/stryker-mutator/stryker/commit/88d7d0e))




<a name="0.7.1"></a>
## [0.7.1](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.7.0...stryker-typescript@0.7.1) (2017-11-27)




**Note:** Version bump only for package stryker-typescript

<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.6.0...stryker-typescript@0.7.0) (2017-11-24)


### Features

* **JavaScript mutator:** Add stryker-javascript-mutator package ([#467](https://github.com/stryker-mutator/stryker/issues/467)) ([06d6bac](https://github.com/stryker-mutator/stryker/commit/06d6bac)), closes [#429](https://github.com/stryker-mutator/stryker/issues/429)




<a name="0.6.0"></a>
# [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.5.0...stryker-typescript@0.6.0) (2017-11-17)


### Bug Fixes

* **stryker-typescript:** Add support for header files ([#451](https://github.com/stryker-mutator/stryker/issues/451)) ([517db10](https://github.com/stryker-mutator/stryker/commit/517db10)), closes [#443](https://github.com/stryker-mutator/stryker/issues/443)


### Features

* **typescript-mutation:** Add a StringLiteral mutator. ([#461](https://github.com/stryker-mutator/stryker/issues/461)) ([43c581c](https://github.com/stryker-mutator/stryker/commit/43c581c))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.4.1...stryker-typescript@0.5.0) (2017-11-14)


### Features

* **typescript-mutator:** Implement new ArrowFunctionMutator ([#460](https://github.com/stryker-mutator/stryker/issues/460)) ([d5fe462](https://github.com/stryker-mutator/stryker/commit/d5fe462)), closes [#456](https://github.com/stryker-mutator/stryker/issues/456)




<a name="0.4.1"></a>
## [0.4.1](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.4.0...stryker-typescript@0.4.1) (2017-11-14)


### Bug Fixes

* **init stryker typescript:** Add init section ([#459](https://github.com/stryker-mutator/stryker/issues/459)) ([c4510d5](https://github.com/stryker-mutator/stryker/commit/c4510d5)), closes [#454](https://github.com/stryker-mutator/stryker/issues/454)




<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.3.0...stryker-typescript@0.4.0) (2017-11-13)


### Features

* **typescript:** Add version check ([#449](https://github.com/stryker-mutator/stryker/issues/449)) ([a780189](https://github.com/stryker-mutator/stryker/commit/a780189)), closes [#437](https://github.com/stryker-mutator/stryker/issues/437)




<a name="0.3.0"></a>
# [0.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.2.0...stryker-typescript@0.3.0) (2017-10-24)


### Features

* **transpiler api:** Async transpiler plugin support ([#433](https://github.com/stryker-mutator/stryker/issues/433)) ([794e587](https://github.com/stryker-mutator/stryker/commit/794e587))




<a name="0.2.0"></a>
## [0.2.0](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.1.0...stryker-typescript@0.2.0) (2017-10-20)


### Bug Fixes

* **homepage:** Set correct hompage in package.json ([#424](https://github.com/stryker-mutator/stryker/issues/424)) ([30e563b](https://github.com/stryker-mutator/stryker/commit/30e563b))




<a name="0.1.0"></a>
# [0.1.0](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.0.2...stryker-typescript@0.1.0) (2017-10-03)


### Features

* **typescript:** Force no code quality compiler options ([#393](https://github.com/stryker-mutator/stryker/issues/393)) ([3445cbf](https://github.com/stryker-mutator/stryker/commit/3445cbf))




<a name="0.0.2"></a>
## [0.0.2](https://github.com/stryker-mutator/stryker/compare/stryker-typescript@0.0.1...stryker-typescript@0.0.2) (2017-09-22)


### Bug Fixes

* **package.json:** Add dependency to tslib. ([#387](https://github.com/stryker-mutator/stryker/issues/387)) ([fcc8b88](https://github.com/stryker-mutator/stryker/commit/fcc8b88))




<a name="0.0.1"></a>
# 0.0.1 (2017-09-19)


### Features

* **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))


### BREAKING CHANGES

* **typescript:** * Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
* Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`.
