# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)


### Bug Fixes

* **validation:** don't warn about the commandRunner options ([2128b9a](https://github.com/stryker-mutator/stryker/commit/2128b9ad5addb5617847234be2f7f34195671661))





# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/core





## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/core





## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)


### Bug Fixes

* **init:** use correct schema reference ([#2213](https://github.com/stryker-mutator/stryker/issues/2213)) ([136f538](https://github.com/stryker-mutator/stryker/commit/136f538c17140196b88ccaf80d3082546262a4e8))





## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)


### Bug Fixes

* **options:** resolve false positives in unknown options warning ([#2208](https://github.com/stryker-mutator/stryker/issues/2208)) ([e3905f6](https://github.com/stryker-mutator/stryker/commit/e3905f6a4efa5aa32c4d76d09bff4692a35e78a9))





## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/core





# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)


### Features

* **api:** Deprecated Config in favor of StrykerOptions ([dccdd91](https://github.com/stryker-mutator/stryker/commit/dccdd9119743d776e2dc4b572a9e02b1524ef88b))
* **init:** add reference to mono schema ([#2162](https://github.com/stryker-mutator/stryker/issues/2162)) ([61953c7](https://github.com/stryker-mutator/stryker/commit/61953c703631619b51442298e1cff8532c336d4a))
* **validation:**  validate StrykerOptions using JSON schema ([5f05665](https://github.com/stryker-mutator/stryker/commit/5f0566581abdd1229dfe5d27a25a676bec93d8f8))
* **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))
* **validation:** hide stacktrace on validation error ([8c5ee88](https://github.com/stryker-mutator/stryker/commit/8c5ee889c7b06569bbfeb6a9557b8cecda16f0eb))
* **validation:** warn about unknown stryker config options ([#2164](https://github.com/stryker-mutator/stryker/issues/2164)) ([8c6fd97](https://github.com/stryker-mutator/stryker/commit/8c6fd972dc57e246d361132dc176920d380c91cc)), closes [#2103](https://github.com/stryker-mutator/stryker/issues/2103)





# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)


### Bug Fixes

* **api:** allow for different api versions of File ([#2124](https://github.com/stryker-mutator/stryker/issues/2124)) ([589de85](https://github.com/stryker-mutator/stryker/commit/589de85361297999c8b5625e800783a18e6507e5))





## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)


### Bug Fixes

* **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))





## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

**Note:** Version bump only for package @stryker-mutator/core





# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)


### Bug Fixes

* **api:** allow for different api versions of File ([#2042](https://github.com/stryker-mutator/stryker/issues/2042)) ([9d1fcc1](https://github.com/stryker-mutator/stryker/commit/9d1fcc17e3e8125d8aa9174e3092d4f9913cc656)), closes [#2025](https://github.com/stryker-mutator/stryker/issues/2025)
* **mocha:**  support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)


### Features

* **config:** Allow a `stryker.conf.json` as default config file. ([#2092](https://github.com/stryker-mutator/stryker/issues/2092)) ([2279813](https://github.com/stryker-mutator/stryker/commit/2279813dec4f9fabbfe9dcd521dc2e19d5902dc6))
* **core:** exit code 1 when error in initial run ([49c5162](https://github.com/stryker-mutator/stryker/commit/49c5162461b5240a6c4204305cb21a7dd74d5172))
* **excludedMutations:** remove deprecated mutation names ([#2027](https://github.com/stryker-mutator/stryker/issues/2027)) ([6f7bfe1](https://github.com/stryker-mutator/stryker/commit/6f7bfe13e8ec681d73c97d9b7fbd3f88a313ed6d))
* **HtmlReporter:** include the html reporter in the core package and add it to the default reporters ([#2036](https://github.com/stryker-mutator/stryker/issues/2036)) ([09702d9](https://github.com/stryker-mutator/stryker/commit/09702d9a05387f407d8fc43d21db38b3a14cbec7)), closes [#1919](https://github.com/stryker-mutator/stryker/issues/1919)
* **Initializer:** Initialize config file as JSON by default ([#2093](https://github.com/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.com/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.com/stryker-mutator/stryker/issues/2000)
* **promisified fs:** use node 10 promisified functions ([#2028](https://github.com/stryker-mutator/stryker/issues/2028)) ([1c57d8f](https://github.com/stryker-mutator/stryker/commit/1c57d8f4620c2392e167f45fa20aa6acbd0c7a7d))
* **react:** change react to create-react-app ([#1978](https://github.com/stryker-mutator/stryker/issues/1978)) ([7f34f28](https://github.com/stryker-mutator/stryker/commit/7f34f28dda821da561ae7ea5d041bb58fca4c011))
* **Reporter.onScoreCalculated:** remove deprecated onScoreCalculatedevent ([#2026](https://github.com/stryker-mutator/stryker/issues/2026)) ([9fa4175](https://github.com/stryker-mutator/stryker/commit/9fa41757d7bed58c98bc3fbd0c8c861670fbd025))


### BREAKING CHANGES

* **core:** Stryker now exists with exitCode `1` if an error of any kind occurs.
* **Reporter.onScoreCalculated:** Please use the `onMutationTestReportReady` event and the `mutation-testing-metrics` npm package to calculate the mutation testing report metrics.

This
```ts
class MyReporter {
  onScoreCalculated(scoreResult) {
     // => do stuff with score result
  }
}
```

Becomes this:
```ts
import { calculateMetrics } from 'mutation-testing-metrics';
class MyReporter {
  onMutationTestingReportReady(report){
    const reportMetrics = calculateMetrics(report.files);
    // => do stuff with report metrics
  }
}
```
* **HtmlReporter:** the `html` reporter is now enabled by default. If you don't want to use it, be sure to override the `reporters` configuration option.

```json
{
  "reporters": ["progress", "clear-text"]
}
```
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
* **promisified fs:** removed fsAsPromised from @stryker-mutator/util





# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)


### Features

* **.gitignore:** add Stryker patterns to .gitignore file during initialization ([#1848](https://github.com/stryker-mutator/stryker/issues/1848)) ([854aee0](https://github.com/stryker-mutator/stryker/commit/854aee0))





# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)


### Features

* **dashboard-reporter:** add github actions ci provider ([#1869](https://github.com/stryker-mutator/stryker/issues/1869)) ([b38b30d](https://github.com/stryker-mutator/stryker/commit/b38b30d))
* **excludedMutations:** Implement new naming of mutators ([#1855](https://github.com/stryker-mutator/stryker/issues/1855)) ([c9b3bcb](https://github.com/stryker-mutator/stryker/commit/c9b3bcb))
* **json config:** support json-file config ([#1853](https://github.com/stryker-mutator/stryker/issues/1853)) ([49495ef](https://github.com/stryker-mutator/stryker/commit/49495ef))
* **progress-reporter:** improve reported progress ux ([d7a6f88](https://github.com/stryker-mutator/stryker/commit/d7a6f88))
* **report:** support upload of full report to dashboard ([#1783](https://github.com/stryker-mutator/stryker/issues/1783)) ([fbb8102](https://github.com/stryker-mutator/stryker/commit/fbb8102))





# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)


### Bug Fixes

* **core:** undefined reference error in coverage recording ([0a68c9c](https://github.com/stryker-mutator/stryker/commit/0a68c9c))





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/core





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)


### Bug Fixes

* edge cases, duplication, log output ([#1720](https://github.com/stryker-mutator/stryker/issues/1720)) ([7f42d34](https://github.com/stryker-mutator/stryker/commit/7f42d34))
* **tempDir:** don't resolve temp dir as input file ([#1710](https://github.com/stryker-mutator/stryker/issues/1710)) ([bbdd02a](https://github.com/stryker-mutator/stryker/commit/bbdd02a))


### Features

* **javascript-mutator:** allow to override babel plugins ([#1764](https://github.com/stryker-mutator/stryker/issues/1764)) ([ddb3d60](https://github.com/stryker-mutator/stryker/commit/ddb3d60))
* **mutant-matcher:** lower memory usage ([#1794](https://github.com/stryker-mutator/stryker/issues/1794)) ([16294e5](https://github.com/stryker-mutator/stryker/commit/16294e5))
* **progress-reporter:** show timed out mutant count ([#1818](https://github.com/stryker-mutator/stryker/issues/1818)) ([067df6d](https://github.com/stryker-mutator/stryker/commit/067df6d))
* **stryker:** remind user to add `.stryker-temp` to gitignore ([#1722](https://github.com/stryker-mutator/stryker/issues/1722)) ([596e1ee](https://github.com/stryker-mutator/stryker/commit/596e1ee))





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)


### Features

* **mocha:** support mocha 6.2 ([feddcf1](https://github.com/stryker-mutator/stryker/commit/feddcf1))





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)


### Bug Fixes

* **child process:** cleanup after dispose ([#1636](https://github.com/stryker-mutator/stryker/issues/1636)) ([3fd5db9](https://github.com/stryker-mutator/stryker/commit/3fd5db9))
* **child process proxy:** OutOfMemory detection ([#1635](https://github.com/stryker-mutator/stryker/issues/1635)) ([4324d9f](https://github.com/stryker-mutator/stryker/commit/4324d9f))
* **dispose:** fix race condition in dispose action ([124ef6a](https://github.com/stryker-mutator/stryker/commit/124ef6a)), closes [#1542](https://github.com/stryker-mutator/stryker/issues/1542)





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)


### Bug Fixes

* **inquirer:** fix inquirer types ([#1563](https://github.com/stryker-mutator/stryker/issues/1563)) ([37ca23c](https://github.com/stryker-mutator/stryker/commit/37ca23c))





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Features

* **deps:** update source-map dep to current major release ([45fa0f8](https://github.com/stryker-mutator/stryker/commit/45fa0f8))
* **formatting:** remove dependency on prettier ([#1552](https://github.com/stryker-mutator/stryker/issues/1552)) ([24543d3](https://github.com/stryker-mutator/stryker/commit/24543d3)), closes [#1261](https://github.com/stryker-mutator/stryker/issues/1261)
* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)


### Bug Fixes

* **clean up:** prevent sandbox creation after dispose ([#1527](https://github.com/stryker-mutator/stryker/issues/1527)) ([73fc0a8](https://github.com/stryker-mutator/stryker/commit/73fc0a8))





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)


### Bug Fixes

* **dispose:** clean up child processes in alternative flows ([#1520](https://github.com/stryker-mutator/stryker/issues/1520)) ([31ee085](https://github.com/stryker-mutator/stryker/commit/31ee085))





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)


### Features

* **reporter:** implement `mutationTestReport` ([16ba76b](https://github.com/stryker-mutator/stryker/commit/16ba76b))





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)


### Bug Fixes

* **broadcast-reporter:** log error detail ([#1461](https://github.com/stryker-mutator/stryker/issues/1461)) ([2331847](https://github.com/stryker-mutator/stryker/commit/2331847))





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)


### Bug Fixes

* **presets:** install v1.x dependencies instead of v0.x ([#1434](https://github.com/stryker-mutator/stryker/issues/1434)) ([7edda46](https://github.com/stryker-mutator/stryker/commit/7edda46))





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/core





## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)


### Bug Fixes

* **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/core





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.35.1...@stryker-mutator/core@1.0.0) (2019-02-13)


### Features

* **config injection:** remove Config from the DI tokens ([#1389](https://github.com/stryker-mutator/stryker/issues/1389)) ([857e4a5](https://github.com/stryker-mutator/stryker/commit/857e4a5))
* **ES5 support:** remove ES5 mutator ([#1370](https://github.com/stryker-mutator/stryker/issues/1370)) ([cb585b4](https://github.com/stryker-mutator/stryker/commit/cb585b4))
* **factories:** remove deprecated factories ([#1381](https://github.com/stryker-mutator/stryker/issues/1381)) ([df2fcdf](https://github.com/stryker-mutator/stryker/commit/df2fcdf))
* **getLogger:** remove getLogger and LoggerFactory from the API ([#1385](https://github.com/stryker-mutator/stryker/issues/1385)) ([cb14e67](https://github.com/stryker-mutator/stryker/commit/cb14e67))
* **InputFileResolver:** remove InputFileDescriptor support ([#1390](https://github.com/stryker-mutator/stryker/issues/1390)) ([7598bc0](https://github.com/stryker-mutator/stryker/commit/7598bc0))
* **port:** remove port config key ([#1386](https://github.com/stryker-mutator/stryker/issues/1386)) ([9c65aa2](https://github.com/stryker-mutator/stryker/commit/9c65aa2))
* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))
* **reporter config:** remove deprecated reporter config option ([#1371](https://github.com/stryker-mutator/stryker/issues/1371)) ([2034a67](https://github.com/stryker-mutator/stryker/commit/2034a67))
* **timeoutMS:** remove deprecated timeoutMs property ([#1382](https://github.com/stryker-mutator/stryker/issues/1382)) ([8d5f682](https://github.com/stryker-mutator/stryker/commit/8d5f682))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker -> @stryker-mutator/core
* **config injection:** Remove Config object from Dependency Injection (only relevant for plugin creators).
* **getLogger:** Remove `getLogger` and `LoggerFactory` from the API. Please use dependency injection to inject a logger. See https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md#plugins for more detail
* **port:** Remove the port config key. Ports should be automatically selected.
* **InputFileResolver:** Remove InputFileDescriptor support. Entries of the `files` and `mutate` array should only contain strings, not objects. The `files` array can be removed in most cases as it can be generated using Git.
* **factories:** Remove the Factory (and children) from the stryker-api package. Use DI to ensure classes are created. For more information, see https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md#dependency-injection
* **reporter config:** Remove the 'reporter' config option. Please use the 'reporters' (plural) config option instead.
* **ES5 support:** Remove the ES5 mutator. The 'javascript' mutator is now the default mutator. Users without a mutator plugin should install `@stryker-mutator/javascript-mutator`.
* **timeoutMS:** Remove the 'timeoutMs' config option. Please use the 'timeoutMS' config option instead.





## [0.35.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.35.0...stryker@0.35.1) (2019-02-12)


### Bug Fixes

* **mutants:** Prevent memory leak when transpiling mutants ([#1376](https://github.com/stryker-mutator/stryker/issues/1376)) ([45c2852](https://github.com/stryker-mutator/stryker/commit/45c2852)), closes [#920](https://github.com/stryker-mutator/stryker/issues/920)





# [0.35.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.34.0...stryker@0.35.0) (2019-02-08)


### Bug Fixes

* **stryker:** Add logging on debug level for transpile errors ([7063216](https://github.com/stryker-mutator/stryker/commit/7063216))


### Features

* **config-editors:** Remove side effects from all config editor plugins ([#1317](https://github.com/stryker-mutator/stryker/issues/1317)) ([1f61bed](https://github.com/stryker-mutator/stryker/commit/1f61bed))
* **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
* **html-reporter:** Remove side effects from html reporter ([#1314](https://github.com/stryker-mutator/stryker/issues/1314)) ([66d65f7](https://github.com/stryker-mutator/stryker/commit/66d65f7))
* **mutators:** Remove side effects from mutator plugins ([#1352](https://github.com/stryker-mutator/stryker/issues/1352)) ([edaf401](https://github.com/stryker-mutator/stryker/commit/edaf401))
* **port:** Deprecate property 'port' ([#1309](https://github.com/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.com/stryker-mutator/stryker/commit/2539ee0))
* **test-frameworks:** Remove side effects from all test-framework plugins  ([#1319](https://github.com/stryker-mutator/stryker/issues/1319)) ([a7160f4](https://github.com/stryker-mutator/stryker/commit/a7160f4))
* **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))
* **transpilers:** Remove side effects transpiler plugins ([#1351](https://github.com/stryker-mutator/stryker/issues/1351)) ([9a8b539](https://github.com/stryker-mutator/stryker/commit/9a8b539))





<a name="0.34.0"></a>
# [0.34.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.33.2...stryker@0.34.0) (2018-12-23)


### Features

* **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))
* **zero config:** Support mutation testing without any configuration ([#1264](https://github.com/stryker-mutator/stryker/issues/1264)) ([fe8f696](https://github.com/stryker-mutator/stryker/commit/fe8f696))




<a name="0.33.2"></a>
## [0.33.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.33.1...stryker@0.33.2) (2018-12-12)




**Note:** Version bump only for package stryker

<a name="0.33.1"></a>
## [0.33.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.33.0...stryker@0.33.1) (2018-11-29)


### Bug Fixes

* **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))




<a name="0.33.0"></a>
# [0.33.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.32.1...stryker@0.33.0) (2018-11-29)


### Bug Fixes

* **JestTestRunner:** run jest with --findRelatedTests ([#1235](https://github.com/stryker-mutator/stryker/issues/1235)) ([5e0790e](https://github.com/stryker-mutator/stryker/commit/5e0790e))


### Features

* **console-colors:** Add a global config option to enable/disable colors in console ([#1251](https://github.com/stryker-mutator/stryker/issues/1251)) ([19b1d64](https://github.com/stryker-mutator/stryker/commit/19b1d64))
* **Stryker CLI 'init':** Support for preset configuration during 'stryker init' ([#1248](https://github.com/stryker-mutator/stryker/issues/1248)) ([5673e6b](https://github.com/stryker-mutator/stryker/commit/5673e6b))




<a name="0.32.1"></a>
## [0.32.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.32.0...stryker@0.32.1) (2018-11-21)


### Bug Fixes

* **log4js:** Don't log log4js category to console ([#1246](https://github.com/stryker-mutator/stryker/issues/1246)) ([479d999](https://github.com/stryker-mutator/stryker/commit/479d999))




<a name="0.32.0"></a>
# [0.32.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.31.0...stryker@0.32.0) (2018-11-13)


### Features

* **error debugging:** add remark to run again with loglevel trace ([#1231](https://github.com/stryker-mutator/stryker/issues/1231)) ([c9e3d97](https://github.com/stryker-mutator/stryker/commit/c9e3d97)), closes [#1205](https://github.com/stryker-mutator/stryker/issues/1205)




<a name="0.31.0"></a>
# [0.31.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.30.1...stryker@0.31.0) (2018-11-07)


### Features

* **clear text reporter:** Prettify the clear-text report ([#1185](https://github.com/stryker-mutator/stryker/issues/1185)) ([a49829b](https://github.com/stryker-mutator/stryker/commit/a49829b))




<a name="0.30.1"></a>
## [0.30.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.30.0...stryker@0.30.1) (2018-10-25)


### Bug Fixes

* **file resolving:** ignore dirs from git submodules ([#1195](https://github.com/stryker-mutator/stryker/issues/1195)) ([7806083](https://github.com/stryker-mutator/stryker/commit/7806083))




<a name="0.30.0"></a>
# [0.30.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.5...stryker@0.30.0) (2018-10-15)


### Bug Fixes

* **any-promise:** Don't register a promise implementation ([#1180](https://github.com/stryker-mutator/stryker/issues/1180)) ([1d3e2f6](https://github.com/stryker-mutator/stryker/commit/1d3e2f6))


### Features

* **ProgressReporter:** Format estimated time of completion (ETC) ([#1176](https://github.com/stryker-mutator/stryker/issues/1176)) ([4e76b46](https://github.com/stryker-mutator/stryker/commit/4e76b46))




<a name="0.29.5"></a>
## [0.29.5](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.4...stryker@0.29.5) (2018-10-03)




**Note:** Version bump only for package stryker

<a name="0.29.4"></a>
## [0.29.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.3...stryker@0.29.4) (2018-10-02)


### Bug Fixes

* **ScoreResultCalculator:** fix faulty filenames in stryker score result ([#1165](https://github.com/stryker-mutator/stryker/issues/1165)) ([2555f49](https://github.com/stryker-mutator/stryker/commit/2555f49)), closes [#1140](https://github.com/stryker-mutator/stryker/issues/1140)




<a name="0.29.3"></a>
## [0.29.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.2...stryker@0.29.3) (2018-09-30)


### Bug Fixes

* **karma-runner:** improve error message ([#1145](https://github.com/stryker-mutator/stryker/issues/1145)) ([2e56d38](https://github.com/stryker-mutator/stryker/commit/2e56d38))




<a name="0.29.2"></a>
## [0.29.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.1...stryker@0.29.2) (2018-09-14)




**Note:** Version bump only for package stryker

<a name="0.29.1"></a>
## [0.29.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.0...stryker@0.29.1) (2018-08-28)




**Note:** Version bump only for package stryker

<a name="0.29.0"></a>
# [0.29.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.28.0...stryker@0.29.0) (2018-08-21)


### Features

* **stryker config:** rename config setting `timeoutMs` to `timeoutMS` ([#1099](https://github.com/stryker-mutator/stryker/issues/1099)) ([3ded998](https://github.com/stryker-mutator/stryker/commit/3ded998)), closes [#860](https://github.com/stryker-mutator/stryker/issues/860)




<a name="0.28.0"></a>
# [0.28.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.27.1...stryker@0.28.0) (2018-08-19)


### Features

* **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)




<a name="0.27.1"></a>
## [0.27.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.27.0...stryker@0.27.1) (2018-08-17)


### Bug Fixes

* **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))




<a name="0.27.0"></a>
# [0.27.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.26.2...stryker@0.27.0) (2018-08-17)


### Features

* **Command test runner:** Add command test runner ([#1047](https://github.com/stryker-mutator/stryker/issues/1047)) ([ee919fb](https://github.com/stryker-mutator/stryker/commit/ee919fb)), closes [#768](https://github.com/stryker-mutator/stryker/issues/768)




<a name="0.26.2"></a>
## [0.26.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.26.1...stryker@0.26.2) (2018-08-16)




**Note:** Version bump only for package stryker

<a name="0.26.1"></a>
## [0.26.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.26.0...stryker@0.26.1) (2018-08-03)


### Bug Fixes

* **stryker:** Clear timeouts so stryker exits correctly ([#1063](https://github.com/stryker-mutator/stryker/issues/1063)) ([2058382](https://github.com/stryker-mutator/stryker/commit/2058382))




<a name="0.26.0"></a>
# [0.26.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.25.1...stryker@0.26.0) (2018-08-03)


### Features

* **child process:** Make all child processes silent ([#1039](https://github.com/stryker-mutator/stryker/issues/1039)) ([80b044a](https://github.com/stryker-mutator/stryker/commit/80b044a)), closes [#1038](https://github.com/stryker-mutator/stryker/issues/1038) [#976](https://github.com/stryker-mutator/stryker/issues/976)




<a name="0.25.1"></a>
## [0.25.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.25.0...stryker@0.25.1) (2018-07-23)


### Bug Fixes

* **Test runner:** Don't crash on first failure ([#1037](https://github.com/stryker-mutator/stryker/issues/1037)) ([94790c3](https://github.com/stryker-mutator/stryker/commit/94790c3))




<a name="0.25.0"></a>
# [0.25.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.24.2...stryker@0.25.0) (2018-07-20)


### Bug Fixes

* **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)
* **stryker:** log runtime error messages on debug ([#1030](https://github.com/stryker-mutator/stryker/issues/1030)) ([27fc6de](https://github.com/stryker-mutator/stryker/commit/27fc6de)), closes [#977](https://github.com/stryker-mutator/stryker/issues/977)


### Features

* **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)
* **stryker init:** Add support for yarn installs to `stryker init` ([#962](https://github.com/stryker-mutator/stryker/issues/962)) ([5aca197](https://github.com/stryker-mutator/stryker/commit/5aca197))




<a name="0.24.2"></a>
## [0.24.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.24.1...stryker@0.24.2) (2018-07-04)


### Bug Fixes

* **stryker:** kill entire test process tree ([#927](https://github.com/stryker-mutator/stryker/issues/927)) ([71af3e3](https://github.com/stryker-mutator/stryker/commit/71af3e3))




<a name="0.24.1"></a>
## [0.24.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.24.0...stryker@0.24.1) (2018-05-31)


### Bug Fixes

* **Peer dep:** set correct stryker-api peer dependency ([#830](https://github.com/stryker-mutator/stryker/issues/830)) ([af973a1](https://github.com/stryker-mutator/stryker/commit/af973a1))




<a name="0.24.0"></a>
# [0.24.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.23.0...stryker@0.24.0) (2018-05-21)


### Features

* **Dashboard reporter:** add support for CircleCI ([a58afff](https://github.com/stryker-mutator/stryker/commit/a58afff))




<a name="0.23.0"></a>
# [0.23.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.4...stryker@0.23.0) (2018-04-30)


### Features

* **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))


### BREAKING CHANGES

* **node version:** Node 4 is no longer supported.




<a name="0.22.4"></a>
## [0.22.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.3...stryker@0.22.4) (2018-04-20)


### Bug Fixes

* **Sandbox:** make sure .stryker-tmp does not appear in the sandbox ([#716](https://github.com/stryker-mutator/stryker/issues/716)) ([48acc2c](https://github.com/stryker-mutator/stryker/commit/48acc2c)), closes [#698](https://github.com/stryker-mutator/stryker/issues/698)




<a name="0.22.3"></a>
## [0.22.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.2...stryker@0.22.3) (2018-04-20)


### Bug Fixes

* **Sandbox pool:** remove race condition ([#714](https://github.com/stryker-mutator/stryker/issues/714)) ([a3606d8](https://github.com/stryker-mutator/stryker/commit/a3606d8)), closes [#713](https://github.com/stryker-mutator/stryker/issues/713)




<a name="0.22.2"></a>
## [0.22.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.1...stryker@0.22.2) (2018-04-20)




**Note:** Version bump only for package stryker

<a name="0.22.1"></a>
## [0.22.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.0...stryker@0.22.1) (2018-04-13)


### Bug Fixes

* **Dependencies:** set correct stryker-api dependency ([#694](https://github.com/stryker-mutator/stryker/issues/694)) ([e333fd9](https://github.com/stryker-mutator/stryker/commit/e333fd9))




<a name="0.22.0"></a>
# [0.22.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.21.1...stryker@0.22.0) (2018-04-11)


### Features

* **Sandbox isolation:** symbolic link node_modules in sandboxes ([#689](https://github.com/stryker-mutator/stryker/issues/689)) ([487ab7c](https://github.com/stryker-mutator/stryker/commit/487ab7c))




<a name="0.21.1"></a>
## [0.21.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.21.0...stryker@0.21.1) (2018-04-09)


### Bug Fixes

* **Dashboard reporter:** fix typos ([047a370](https://github.com/stryker-mutator/stryker/commit/047a370))




<a name="0.21.0"></a>
# [0.21.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.20.1...stryker@0.21.0) (2018-04-04)


### Bug Fixes

* **Progress reporter:** don't prevent stryker from closing ([21255aa](https://github.com/stryker-mutator/stryker/commit/21255aa))


### Features

* **identify-files:** use git to list files in `InputFileResolver` ([df6169a](https://github.com/stryker-mutator/stryker/commit/df6169a))


### BREAKING CHANGES

* **identify-files:** * The `InputFileDescriptor` syntax for files is no longer supported.
* Test runner plugins should keep track of which files are included
into a test run and in which order.
* Transpiler plugins should keep track of which files are to be
transpiled.




<a name="0.20.1"></a>
## [0.20.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.20.0...stryker@0.20.1) (2018-03-22)


### Bug Fixes

* **peerDependency:** update stryker-api requirement to ^0.14.0 ([3ce04d4](https://github.com/stryker-mutator/stryker/commit/3ce04d4))




<a name="0.20.0"></a>
# [0.20.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.4...stryker@0.20.0) (2018-03-22)


### Features

* **stryker:** add excludedMutations as a config option ([#13](https://github.com/stryker-mutator/stryker/issues/13)) ([#652](https://github.com/stryker-mutator/stryker/issues/652)) ([cc8a5f1](https://github.com/stryker-mutator/stryker/commit/cc8a5f1))




<a name="0.19.4"></a>
## [0.19.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.3...stryker@0.19.4) (2018-03-21)




**Note:** Version bump only for package stryker

<a name="0.19.3"></a>
## [0.19.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.2...stryker@0.19.3) (2018-02-14)


### Bug Fixes

* **coverage-analysis:** make sure to not erase sourceMappingURL comment ([#625](https://github.com/stryker-mutator/stryker/issues/625)) ([eed7147](https://github.com/stryker-mutator/stryker/commit/eed7147))




<a name="0.19.2"></a>
## [0.19.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.1...stryker@0.19.2) (2018-02-08)


### Bug Fixes

* **stryker:** remove import to undependant module ([0956194](https://github.com/stryker-mutator/stryker/commit/0956194))




<a name="0.19.1"></a>
## [0.19.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.0...stryker@0.19.1) (2018-02-07)


### Bug Fixes

* **dependencies:** update stryker-api requirement to ^0.13.0 ([8eba6d4](https://github.com/stryker-mutator/stryker/commit/8eba6d4))




<a name="0.19.0"></a>
# [0.19.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.2...stryker@0.19.0) (2018-02-07)


### Features

* **coverage analysis:** Support transpiled code ([#559](https://github.com/stryker-mutator/stryker/issues/559)) ([7c351ad](https://github.com/stryker-mutator/stryker/commit/7c351ad))
* **dashboard-reporter:** Add dashboard reporter ([#472](https://github.com/stryker-mutator/stryker/issues/472)) ([0693a41](https://github.com/stryker-mutator/stryker/commit/0693a41))




<a name="0.18.2"></a>
## [0.18.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.1...stryker@0.18.2) (2018-02-02)




**Note:** Version bump only for package stryker

<a name="0.18.1"></a>
## [0.18.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.0...stryker@0.18.1) (2018-01-19)




**Note:** Version bump only for package stryker

<a name="0.18.0"></a>
# [0.18.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.2...stryker@0.18.0) (2018-01-12)


### Features

* **Child processes:** Support process message polution ([#572](https://github.com/stryker-mutator/stryker/issues/572)) ([dbe4d84](https://github.com/stryker-mutator/stryker/commit/dbe4d84))




<a name="0.17.2"></a>
## [0.17.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.1...stryker@0.17.2) (2018-01-10)


### Bug Fixes

* **es5-mutator:** Describe migration for users with plugins ([6be95c3](https://github.com/stryker-mutator/stryker/commit/6be95c3))




<a name="0.17.1"></a>
## [0.17.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.0...stryker@0.17.1) (2018-01-10)




**Note:** Version bump only for package stryker

<a name="0.17.0"></a>
# [0.17.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.16.0...stryker@0.17.0) (2017-12-21)


### Features

* **cvg analysis:** New coverage instrumenter ([#550](https://github.com/stryker-mutator/stryker/issues/550)) ([2bef577](https://github.com/stryker-mutator/stryker/commit/2bef577))




<a name="0.16.0"></a>
# [0.16.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.6...stryker@0.16.0) (2017-12-19)


### Features

* **config:** [#438](https://github.com/stryker-mutator/stryker/issues/438) Extensive config validation ([#549](https://github.com/stryker-mutator/stryker/issues/549)) ([dc6fdf2](https://github.com/stryker-mutator/stryker/commit/dc6fdf2))




<a name="0.15.6"></a>
## [0.15.6](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.5...stryker@0.15.6) (2017-12-18)




**Note:** Version bump only for package stryker

<a name="0.15.5"></a>
## [0.15.5](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.4...stryker@0.15.5) (2017-12-05)




**Note:** Version bump only for package stryker

<a name="0.15.4"></a>
## [0.15.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.3...stryker@0.15.4) (2017-11-27)




**Note:** Version bump only for package stryker

<a name="0.15.3"></a>
## [0.15.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.2...stryker@0.15.3) (2017-11-27)




**Note:** Version bump only for package stryker

<a name="0.15.2"></a>
## [0.15.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.1...stryker@0.15.2) (2017-11-25)


### Bug Fixes

* **StrykerSpec:** Uncomment tests ([#471](https://github.com/stryker-mutator/stryker/issues/471)) ([4a13afa](https://github.com/stryker-mutator/stryker/commit/4a13afa))




<a name="0.15.1"></a>
## [0.15.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.0...stryker@0.15.1) (2017-11-24)


### Bug Fixes

* **Initializer:** Remove es5 option ([#469](https://github.com/stryker-mutator/stryker/issues/469)) ([98048f4](https://github.com/stryker-mutator/stryker/commit/98048f4))




<a name="0.15.0"></a>
# [0.15.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.14.1...stryker@0.15.0) (2017-11-24)


### Features

* **JavaScript mutator:** Add stryker-javascript-mutator package ([#467](https://github.com/stryker-mutator/stryker/issues/467)) ([06d6bac](https://github.com/stryker-mutator/stryker/commit/06d6bac)), closes [#429](https://github.com/stryker-mutator/stryker/issues/429)




<a name="0.14.1"></a>
## [0.14.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.14.0...stryker@0.14.1) (2017-11-17)




**Note:** Version bump only for package stryker

<a name="0.14.0"></a>
# [0.14.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.13.0...stryker@0.14.0) (2017-11-13)


### Bug Fixes

* **InputFileResolver:** Presume .zip and .tar are binary files. ([#452](https://github.com/stryker-mutator/stryker/issues/452)) ([94f8fdc](https://github.com/stryker-mutator/stryker/commit/94f8fdc)), closes [#447](https://github.com/stryker-mutator/stryker/issues/447)


### Features

* **mocha 4:** Add support for mocha version 4 ([#455](https://github.com/stryker-mutator/stryker/issues/455)) ([de6ae4f](https://github.com/stryker-mutator/stryker/commit/de6ae4f))




<a name="0.13.0"></a>
# [0.13.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.12.0...stryker@0.13.0) (2017-10-24)


### Features

* **default score:** Set default score to 100 ([b9231fe](https://github.com/stryker-mutator/stryker/commit/b9231fe))
* **transpiler api:** Async transpiler plugin support ([#433](https://github.com/stryker-mutator/stryker/issues/433)) ([794e587](https://github.com/stryker-mutator/stryker/commit/794e587))




<a name="0.12.0"></a>
## [0.12.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.2...stryker@0.12.0) (2017-10-20)


### Bug Fixes

* **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)


### BREAKING CHANGES

* **mocha framework:** * Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.




<a name="0.11.2"></a>
## [0.11.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.1...stryker@0.11.2) (2017-10-11)


### Bug Fixes

* **deps:** Remove types for prettier as a dev ([7014322](https://github.com/stryker-mutator/stryker/commit/7014322))




<a name="0.11.1"></a>
## [0.11.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.0...stryker@0.11.1) (2017-10-10)




**Note:** Version bump only for package stryker

<a name="0.11.0"></a>
# [0.11.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.3...stryker@0.11.0) (2017-10-03)


### Bug Fixes

* **progress reporter:** Simpify reported progress ([#401](https://github.com/stryker-mutator/stryker/issues/401)) ([6258ef1](https://github.com/stryker-mutator/stryker/commit/6258ef1)), closes [#400](https://github.com/stryker-mutator/stryker/issues/400)
* **sandbox:** Prevent hanging child processes ([#402](https://github.com/stryker-mutator/stryker/issues/402)) ([ff6962a](https://github.com/stryker-mutator/stryker/commit/ff6962a)), closes [#396](https://github.com/stryker-mutator/stryker/issues/396)


### Features

* **ConfigReader:** Use CLI options with default config file ([#404](https://github.com/stryker-mutator/stryker/issues/404)) ([99cdc61](https://github.com/stryker-mutator/stryker/commit/99cdc61)), closes [#390](https://github.com/stryker-mutator/stryker/issues/390)
* **StrykerInitializer:** Add the option to select mutators and transpilers ([#403](https://github.com/stryker-mutator/stryker/issues/403)) ([c61786f](https://github.com/stryker-mutator/stryker/commit/c61786f))




<a name="0.10.3"></a>
## [0.10.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.2...stryker@0.10.3) (2017-09-22)




**Note:** Version bump only for package stryker

<a name="0.10.2"></a>
# [0.10.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.1...stryker@0.10.2) (2017-09-20)


### Bug Fixes

* **dependency on 'rx':** Remove requires to `'rx'` directly ([71f7330](https://github.com/stryker-mutator/stryker/commit/71f7330))
* **missing dependency:** Remove invalid package-lock file ([aeeeb7b](https://github.com/stryker-mutator/stryker/commit/aeeeb7b))
* **MutationTestExecutor:** Only complete defined observables ([#381](https://github.com/stryker-mutator/stryker/issues/381)) ([a0a1355](https://github.com/stryker-mutator/stryker/commit/a0a1355))


<a name="0.10.1"></a>
# [0.10.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.3...stryker@0.10.1) (2017-09-20)


### Bug Fixes

* **missing dependency:** Remove invalid package-lock file ([aeeeb7b](https://github.com/stryker-mutator/stryker/commit/aeeeb7b))

<a name="0.10.0"></a>
# [0.10.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.3...stryker@0.10.0) (2017-09-19)


### Features

* **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))


### BREAKING CHANGES

* **typescript:** * Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
* Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`.




<a name="0.9.3"></a>
## [0.9.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.2...stryker@0.9.3) (2017-09-09)


### Bug Fixes

* **score-result:** Wrap single file reports ([#379](https://github.com/stryker-mutator/stryker/issues/379)) ([986eb6b](https://github.com/stryker-mutator/stryker/commit/986eb6b))




<a name="0.9.2"></a>
## [0.9.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.1...stryker@0.9.2) (2017-09-06)


### Bug Fixes

* **init command:** indent "stryker.conf.js" file after "stryker init" ([52ac439](https://github.com/stryker-mutator/stryker/commit/52ac439))




<a name="0.9.1"></a>
## [0.9.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.0...stryker@0.9.1) (2017-09-04)


### Bug Fixes

* **stryker-init:** Stryker init won't create temp folder ([#361](https://github.com/stryker-mutator/stryker/issues/361)) ([a4333c9](https://github.com/stryker-mutator/stryker/commit/a4333c9))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.8.0...stryker@0.9.0) (2017-08-25)


### Bug Fixes

* **MochaTestRunner:** Exit with a warning if no tests were executed (#360) ([ac52860](https://github.com/stryker-mutator/stryker/commit/ac52860))


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.8.0"></a>
# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.7.0...stryker@0.8.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)
* **IsolatedTestRunner:** Handle promise rejections (#351) ([f596993](https://github.com/stryker-mutator/stryker/commit/f596993))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.7...stryker@0.7.0) (2017-08-04)


### Features

* **ConfigReader:** Inform about init command (#340) ([7f3e61f](https://github.com/stryker-mutator/stryker/commit/7f3e61f))
* **html-reporter:** Score result as single source of truth (#341) ([47b3295](https://github.com/stryker-mutator/stryker/commit/47b3295)), closes [#335](https://github.com/stryker-mutator/stryker/issues/335)




<a name="0.6.7"></a>
## [0.6.7](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.6...stryker@0.6.7) (2017-07-14)


### Bug Fixes

* **ts-2.4:** Fix type issues for typescript 2.4 (#337) ([c18079b](https://github.com/stryker-mutator/stryker/commit/c18079b)), closes [#337](https://github.com/stryker-mutator/stryker/issues/337)




<a name="0.6.6"></a>
## [0.6.6](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.4...stryker@0.6.6) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))
* Manual version bump ([a67d90b](https://github.com/stryker-mutator/stryker/commit/a67d90b))




<a name="0.6.3"></a>
## [0.6.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.2...stryker@0.6.3) (2017-06-08)


### Bug Fixes

* **intializer:** Remove install of `stryker` itself (#317) ([8b8dd30](https://github.com/stryker-mutator/stryker/commit/8b8dd30)), closes [#316](https://github.com/stryker-mutator/stryker/issues/316)
* **MethodChainMutatorSpec:** Fix test name, so it matches the name of the mutator. (#313) ([5e53982](https://github.com/stryker-mutator/stryker/commit/5e53982)), closes [#313](https://github.com/stryker-mutator/stryker/issues/313)




<a name="0.6.3"></a>
## 0.6.3 (2017-06-02)


### Features

* **Mutators:** Add Boolean substitution mutators (#294) ([a137a97](https://github.com/stryker-mutator/stryker/commit/a137a97))
* **report-score-result:** Report score result as tree (#309) ([965c575](https://github.com/stryker-mutator/stryker/commit/965c575))

<a name="0.6.0"></a>
# 0.6.0 (2017-04-21)


### Bug Fixes

* **IsolatedTestRunnerAdapter:** Don't kill processes using SIGKILL (#270) ([f606e9d](https://github.com/stryker-mutator/stryker/commit/f606e9d))
* **IsolatedTestRunnerAdapter:** Improve error handling when test runner worker process crashes (#285) ([2b4bda7](https://github.com/stryker-mutator/stryker/commit/2b4bda7))


### Features

* **multi-package:** Migrate to multi-package repo (#257) ([0c2fde5](https://github.com/stryker-mutator/stryker/commit/0c2fde5))




<a name="0.5.9"></a>
## [0.5.9](https://github.com/stryker-mutator/stryker/compare/v0.5.8...v0.5.9) (2017-03-01)


### Bug Fixes

* **fileUtilsSpec:** Fix test naming ([#240](https://github.com/stryker-mutator/stryker/issues/240)) ([f1321be](https://github.com/stryker-mutator/stryker/commit/f1321be))
* **IsolatedTestRunner:** Fix channel closed error ([#219](https://github.com/stryker-mutator/stryker/issues/219)) ([202d4b5](https://github.com/stryker-mutator/stryker/commit/202d4b5))



<a name="0.5.8"></a>
## [0.5.8](https://github.com/stryker-mutator/stryker/compare/v0.5.7...v0.5.8) (2017-02-03)


### Bug Fixes

* **bin/stryker:** Changed file permissions on stryker so it's executable on Linux ([#226](https://github.com/stryker-mutator/stryker/issues/226)) ([c1a5798](https://github.com/stryker-mutator/stryker/commit/c1a5798))
* **fs:** Use graceful-fs instead of fs directly ([#221](https://github.com/stryker-mutator/stryker/issues/221)) ([4c1bf41](https://github.com/stryker-mutator/stryker/commit/4c1bf41))
* **typo:** change not coverage to no coverage ([f2c7198](https://github.com/stryker-mutator/stryker/commit/f2c7198))


### Features

* **ArrayDeclarationMutator:** Add new mutator. ([#229](https://github.com/stryker-mutator/stryker/issues/229)) ([9805917](https://github.com/stryker-mutator/stryker/commit/9805917))



<a name="0.5.7"></a>
## [0.5.7](https://github.com/stryker-mutator/stryker/compare/v0.5.6...v0.5.7) (2017-01-16)


### Features

* **append-only-progress:** Implement new reporter ([#213](https://github.com/stryker-mutator/stryker/issues/213)) ([7b68506](https://github.com/stryker-mutator/stryker/commit/7b68506))



<a name="0.5.6"></a>
## [0.5.6](https://github.com/stryker-mutator/stryker/compare/v0.5.5...v0.5.6) (2016-12-31)


### Bug Fixes

* **InputFileResolver:** Don't ignore all files ([#210](https://github.com/stryker-mutator/stryker/issues/210)) ([ef3dde4](https://github.com/stryker-mutator/stryker/commit/ef3dde4))



<a name="0.5.5"></a>
## [0.5.5](https://github.com/stryker-mutator/stryker/compare/v0.5.4...v0.5.5) (2016-12-30)


### Features

* **ClearTextReporter:** Limit the number of tests ([142de71](https://github.com/stryker-mutator/stryker/commit/142de71))
* **ConfigReader:** Look for stryker.conf.js in the CWD ([#209](https://github.com/stryker-mutator/stryker/issues/209)) ([d196fd3](https://github.com/stryker-mutator/stryker/commit/d196fd3))
* **InputfileResolver:** exclude online files from globbing ([#194](https://github.com/stryker-mutator/stryker/issues/194)) ([a114594](https://github.com/stryker-mutator/stryker/commit/a114594))
* **lifetime-support:** Remove 0.12 node support ([38f72ae](https://github.com/stryker-mutator/stryker/commit/38f72ae))
* **progress-reporter:** Create new progress reporter ([#202](https://github.com/stryker-mutator/stryker/issues/202)) ([11c345e](https://github.com/stryker-mutator/stryker/commit/11c345e))
* **ProgressReporter:** add new line after report ([#193](https://github.com/stryker-mutator/stryker/issues/193)) ([931c35f](https://github.com/stryker-mutator/stryker/commit/931c35f))
* **ts21:** Upgrade to TypeScript 2.1 ([#203](https://github.com/stryker-mutator/stryker/issues/203)) ([4ce1d16](https://github.com/stryker-mutator/stryker/commit/4ce1d16))



<a name="0.5.4"></a>
## [0.5.4](https://github.com/stryker-mutator/stryker/compare/v0.5.3...v0.5.4) (2016-12-15)


### Features

* **es2015-promise:** Remove dep to es6-promise ([#189](https://github.com/stryker-mutator/stryker/issues/189)) ([3a34fe1](https://github.com/stryker-mutator/stryker/commit/3a34fe1))
* **exclude-files:** Exclude files with a `!` ([#188](https://github.com/stryker-mutator/stryker/issues/188)) ([05a356d](https://github.com/stryker-mutator/stryker/commit/05a356d))
* **sandbox:** Change cwd in `Sandbox`es ([#187](https://github.com/stryker-mutator/stryker/issues/187)) ([28e1e5d](https://github.com/stryker-mutator/stryker/commit/28e1e5d))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/stryker-mutator/stryker/compare/v0.5.2...v0.5.3) (2016-11-26)


### Features

* **test-runner:** Config for `maxConcurrentTestRunners` ([492bb80](https://github.com/stryker-mutator/stryker/commit/492bb80))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/stryker-mutator/stryker/compare/v0.5.1...v0.5.2) (2016-11-21)


### Bug Fixes

* **coverage:** Make 'perTest' work with dry-run ([d700f20](https://github.com/stryker-mutator/stryker/commit/d700f20))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/stryker-mutator/stryker/compare/v0.5.0...v0.5.1) (2016-11-20)


### Bug Fixes

* **.npmignore:** Add temp folder to npm ignore ([07d1406](https://github.com/stryker-mutator/stryker/commit/07d1406))
* **istanbul:** Add dependency to istanbul ([729d770](https://github.com/stryker-mutator/stryker/commit/729d770))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/stryker-mutator/stryker/compare/v0.4.5...v0.5.0) (2016-11-20)


### Bug Fixes

* **clear-text-reporter:** Fix a typo ([0e009dc](https://github.com/stryker-mutator/stryker/commit/0e009dc))


### Features

* **cli:** Add support for commands ([#181](https://github.com/stryker-mutator/stryker/issues/181)) ([fd824de](https://github.com/stryker-mutator/stryker/commit/fd824de))
* **one-pass-coverage:** Support one-pass coverage measurement ([#165](https://github.com/stryker-mutator/stryker/issues/165)) ([1796c93](https://github.com/stryker-mutator/stryker/commit/1796c93))



<a name="0.4.5"></a>
## [0.4.5](https://github.com/stryker-mutator/stryker/compare/v0.4.4...v0.4.5) (2016-10-29)


### Bug Fixes

* **BlockStatementMutator:** Not mutate empty block ([#160](https://github.com/stryker-mutator/stryker/issues/160)) ([da4a3cf](https://github.com/stryker-mutator/stryker/commit/da4a3cf))
* **stryker:** Stop running if there are no mutants ([#161](https://github.com/stryker-mutator/stryker/issues/161)) ([8f68da8](https://github.com/stryker-mutator/stryker/commit/8f68da8))



<a name="0.4.4"></a>
## [0.4.4](https://github.com/stryker-mutator/stryker/compare/v0.4.3...v0.4.4) (2016-10-04)


### Bug Fixes

* **line-endings:** Enforce unix line endings ([#152](https://github.com/stryker-mutator/stryker/issues/152)) ([554c167](https://github.com/stryker-mutator/stryker/commit/554c167))
* **MutantRunResultMatcher:** False positive fix ([#155](https://github.com/stryker-mutator/stryker/issues/155)) ([255f84b](https://github.com/stryker-mutator/stryker/commit/255f84b)), closes [#155](https://github.com/stryker-mutator/stryker/issues/155)


### Features

* **ts2.0:** Migrate to typescript 2.0 ([#154](https://github.com/stryker-mutator/stryker/issues/154)) ([1c5db5c](https://github.com/stryker-mutator/stryker/commit/1c5db5c))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/stryker-mutator/stryker/compare/v0.1.0...v0.4.3) (2016-09-09)


### Bug Fixes

* **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([3b7e9f9](https://github.com/stryker-mutator/stryker/commit/3b7e9f9))
* **deps:** Set version of stryker-api ([338d8ec](https://github.com/stryker-mutator/stryker/commit/338d8ec))
* **isolated-test-runner:** Support regexes ([#146](https://github.com/stryker-mutator/stryker/issues/146)) ([51b6903](https://github.com/stryker-mutator/stryker/commit/51b6903))
* **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([4a88b58](https://github.com/stryker-mutator/stryker/commit/4a88b58))
* **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([b35e223](https://github.com/stryker-mutator/stryker/commit/b35e223))
* **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([53651b2](https://github.com/stryker-mutator/stryker/commit/53651b2))
* **test-deps:** Set version of stryker-api in it ([a094e4b](https://github.com/stryker-mutator/stryker/commit/a094e4b))
* **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([b03e84b](https://github.com/stryker-mutator/stryker/commit/b03e84b))
* **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([a3c8902](https://github.com/stryker-mutator/stryker/commit/a3c8902))
* **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([1f6a05a](https://github.com/stryker-mutator/stryker/commit/1f6a05a))


### Features

* **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([8aca3bd](https://github.com/stryker-mutator/stryker/commit/8aca3bd))
* **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([0675864](https://github.com/stryker-mutator/stryker/commit/0675864))
* **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([916ae55](https://github.com/stryker-mutator/stryker/commit/916ae55))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/stryker-mutator/stryker/compare/v0.1.0...v0.4.2) (2016-08-09)


### Bug Fixes

* **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([3b7e9f9](https://github.com/stryker-mutator/stryker/commit/3b7e9f9))
* **deps:** Set version of stryker-api ([338d8ec](https://github.com/stryker-mutator/stryker/commit/338d8ec))
* **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([4a88b58](https://github.com/stryker-mutator/stryker/commit/4a88b58))
* **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([b35e223](https://github.com/stryker-mutator/stryker/commit/b35e223))
* **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([53651b2](https://github.com/stryker-mutator/stryker/commit/53651b2))
* **test-deps:** Set version of stryker-api in it ([a094e4b](https://github.com/stryker-mutator/stryker/commit/a094e4b))
* **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([b03e84b](https://github.com/stryker-mutator/stryker/commit/b03e84b))
* **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([a3c8902](https://github.com/stryker-mutator/stryker/commit/a3c8902))
* **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([1f6a05a](https://github.com/stryker-mutator/stryker/commit/1f6a05a))


### Features

* **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([8aca3bd](https://github.com/stryker-mutator/stryker/commit/8aca3bd))
* **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([0675864](https://github.com/stryker-mutator/stryker/commit/0675864))
* **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([916ae55](https://github.com/stryker-mutator/stryker/commit/916ae55))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/stryker-mutator/stryker/compare/v0.4.0...v0.4.1) (2016-07-22)


### Features

* **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([bea5f11](https://github.com/stryker-mutator/stryker/commit/bea5f11))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker/compare/v0.3.2...v0.4.0) (2016-07-21)


### Bug Fixes

* **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([60191e3](https://github.com/stryker-mutator/stryker/commit/60191e3))
* **deps:** Set version of stryker-api ([aa51dc1](https://github.com/stryker-mutator/stryker/commit/aa51dc1))
* **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([e3f3ce1](https://github.com/stryker-mutator/stryker/commit/e3f3ce1))
* **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([f7eda47](https://github.com/stryker-mutator/stryker/commit/f7eda47))
* **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([84790f2](https://github.com/stryker-mutator/stryker/commit/84790f2))
* **test-deps:** Set version of stryker-api in it ([e006ade](https://github.com/stryker-mutator/stryker/commit/e006ade))
* **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([564f15c](https://github.com/stryker-mutator/stryker/commit/564f15c))
* **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([7f0b26a](https://github.com/stryker-mutator/stryker/commit/7f0b26a))
* **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([55afd5e](https://github.com/stryker-mutator/stryker/commit/55afd5e))


### Features

* **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([6c0e229](https://github.com/stryker-mutator/stryker/commit/6c0e229))
* **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([c66e380](https://github.com/stryker-mutator/stryker/commit/c66e380))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/stryker-mutator/stryker/compare/v0.3.1...v0.3.2) (2016-04-28)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/stryker-mutator/stryker/compare/v0.2.1...v0.3.1) (2016-04-17)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/stryker-mutator/stryker/compare/v0.2.0...v0.2.1) (2016-04-14)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/stryker-mutator/stryker/compare/v0.1.0...v0.2.0) (2016-04-08)



<a name="0.1.0"></a>
# [0.1.0](https://github.com/stryker-mutator/stryker/compare/v0.0.0...v0.1.0) (2016-03-24)
