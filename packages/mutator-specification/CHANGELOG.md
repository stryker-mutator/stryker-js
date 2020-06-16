# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)

**Note:** Version bump only for package @stryker-mutator/mutator-specification






# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)


### Bug Fixes

* **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))





## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)


### Features

* **excludedMutations:** remove deprecated mutation names ([#2027](https://github.com/stryker-mutator/stryker/issues/2027)) ([6f7bfe1](https://github.com/stryker-mutator/stryker/commit/6f7bfe13e8ec681d73c97d9b7fbd3f88a313ed6d))


### BREAKING CHANGES

* **excludedMutations:** removes auto-fix for the old names of mutations.

### Migrating:
Almost every mutator has been renamed and/or split. Stryker will warn you about any deprecated mutator names in the `mutator.excludedMutations` section of your config. 

To migrate, please run stryker to see if your project is affected. If this is the case, please take a look at the mutator types on the handbook (see above).

These are the changes:  

| Old mutation           	| New mutation(s)                                       	|
|------------------------	|-------------------------------------------------------	|
| ArrayLiteral           	| ArrayDeclaration                                      	|
| ArrayNewExpression     	| ArrayDeclaration                                      	|
| BinaryExpression       	| ArithmeticOperator, EqualityOperator, LogicalOperator 	|
| Block                  	| BlockStatement                                        	|
| BooleanSubstitution    	| BooleanLiteral                                        	|
| DoStatement            	| ConditionalExpression                                 	|
| ForStatement           	| ConditionalExpression                                 	|
| IfStatement            	| ConditionalExpression                                 	|
| PrefixUnaryExpression  	| UnaryOperator, UpdateOperator, BooleanLiteral         	|
| PostfixUnaryExpression 	| UpdateOperator                                        	|
| SwitchCase             	| ConditionalExpression                                 	|
| WhileStatement         	| ConditionalExpression                                 	|


### New mutations
Due to the migration, some new mutations were added to the **javascript** mutator.
* The mutation _ArrayDeclaration_ will now mutate `new Array()` to `new Array([])`
* The mutation _ArrayDeclaration_ will now mutate `[]` to `["Stryker was here"]`

These mutations were already performed by the typescript mutator.






# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)


### Features

* **TypeScript mutator:** mutate Array constructor calls without the new keyword ([#1903](https://github.com/stryker-mutator/stryker/issues/1903)) ([aecd944](https://github.com/stryker-mutator/stryker/commit/aecd944)), closes [#1902](https://github.com/stryker-mutator/stryker/issues/1902)





# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)


### Features

* **excludedMutations:** Implement new naming of mutators ([#1855](https://github.com/stryker-mutator/stryker/issues/1855)) ([c9b3bcb](https://github.com/stryker-mutator/stryker/commit/c9b3bcb))





# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Features

* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.7.1...@stryker-mutator/mutator-specification@1.0.0) (2019-02-13)


### Features

* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker-mutator-specification -> @stryker-mutator/mutator-specification





## [0.7.1](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.7.0...stryker-mutator-specification@0.7.1) (2019-02-08)

**Note:** Version bump only for package stryker-mutator-specification





<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.6.0...stryker-mutator-specification@0.7.0) (2018-11-29)


### Bug Fixes

* **String literal mutator:** Don't mutate export declarations ([c764ccd](https://github.com/stryker-mutator/stryker/commit/c764ccd))


### Features

* **Conditional expression mutator:** Mutate conditional operators ([#1253](https://github.com/stryker-mutator/stryker/issues/1253)) ([be4c990](https://github.com/stryker-mutator/stryker/commit/be4c990))




<a name="0.6.0"></a>
# [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.5.1...stryker-mutator-specification@0.6.0) (2018-10-06)


### Features

* **mutator:** Object literal mutator ([#1169](https://github.com/stryker-mutator/stryker/issues/1169)) ([43d9a3a](https://github.com/stryker-mutator/stryker/commit/43d9a3a))




<a name="0.5.1"></a>
## [0.5.1](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.5.0...stryker-mutator-specification@0.5.1) (2018-09-30)


### Bug Fixes

* **mutator:** Fix empty case statement unkillable mutant ([#1159](https://github.com/stryker-mutator/stryker/issues/1159)) ([e080acb](https://github.com/stryker-mutator/stryker/commit/e080acb))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.4.0...stryker-mutator-specification@0.5.0) (2018-09-14)


### Features

* **mutator:** add SwitchCase statement mutator ([#1127](https://github.com/stryker-mutator/stryker/issues/1127)) ([cec6a39](https://github.com/stryker-mutator/stryker/commit/cec6a39))




<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.3.1...stryker-mutator-specification@0.4.0) (2018-07-20)


### Features

* **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)




<a name="0.3.1"></a>
## [0.3.1](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.3.0...stryker-mutator-specification@0.3.1) (2018-05-31)


### Bug Fixes

* **String mutator:** do not mutate prologue directives ([#829](https://github.com/stryker-mutator/stryker/issues/829)) ([6e80251](https://github.com/stryker-mutator/stryker/commit/6e80251))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.2.3...stryker-mutator-specification@0.3.0) (2018-04-30)


### Features

* **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))


### BREAKING CHANGES

* **node version:** Node 4 is no longer supported.




<a name="0.2.3"></a>
## [0.2.3](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.2.2...stryker-mutator-specification@0.2.3) (2018-04-20)


### Bug Fixes

* **String mutator:** do not mutate jsx attributes ([#711](https://github.com/stryker-mutator/stryker/issues/711)) ([6656621](https://github.com/stryker-mutator/stryker/commit/6656621)), closes [#701](https://github.com/stryker-mutator/stryker/issues/701)




<a name="0.2.2"></a>
## [0.2.2](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.2.1...stryker-mutator-specification@0.2.2) (2018-03-21)




**Note:** Version bump only for package stryker-mutator-specification

<a name="0.2.1"></a>
## [0.2.1](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.2.0...stryker-mutator-specification@0.2.1) (2018-01-12)




**Note:** Version bump only for package stryker-mutator-specification

<a name="0.2.0"></a>
# 0.2.0 (2017-11-24)


### Features

* **JavaScript mutator:** Add stryker-javascript-mutator package ([#467](https://github.com/stryker-mutator/stryker/issues/467)) ([06d6bac](https://github.com/stryker-mutator/stryker/commit/06d6bac)), closes [#429](https://github.com/stryker-mutator/stryker/issues/429)
