# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
