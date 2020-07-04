# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)


### Bug Fixes

* **validation:** don't warn about the commandRunner options ([2128b9a](https://github.com/stryker-mutator/stryker/commit/2128b9ad5addb5617847234be2f7f34195671661))





# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/api





## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/api





## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/api





## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)


### Bug Fixes

* **options:** resolve false positives in unknown options warning ([#2208](https://github.com/stryker-mutator/stryker/issues/2208)) ([e3905f6](https://github.com/stryker-mutator/stryker/commit/e3905f6a4efa5aa32c4d76d09bff4692a35e78a9))





## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/api





# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)


### Features

* **api:** Deprecated Config in favor of StrykerOptions ([dccdd91](https://github.com/stryker-mutator/stryker/commit/dccdd9119743d776e2dc4b572a9e02b1524ef88b))
* **api:** export the StrykerOptions JSON schema ([0bb222d](https://github.com/stryker-mutator/stryker/commit/0bb222db07638ecf196eba9d8c88e086cd15239f))
* **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))
* **validation:** warn about unknown stryker config options ([#2164](https://github.com/stryker-mutator/stryker/issues/2164)) ([8c6fd97](https://github.com/stryker-mutator/stryker/commit/8c6fd972dc57e246d361132dc176920d380c91cc)), closes [#2103](https://github.com/stryker-mutator/stryker/issues/2103)






# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)


### Bug Fixes

* **api:** allow for different api versions of File ([#2124](https://github.com/stryker-mutator/stryker/issues/2124)) ([589de85](https://github.com/stryker-mutator/stryker/commit/589de85361297999c8b5625e800783a18e6507e5))





## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)


### Bug Fixes

* **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))





## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

**Note:** Version bump only for package @stryker-mutator/api





# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)


### Bug Fixes

* **api:** allow for different api versions of File ([#2042](https://github.com/stryker-mutator/stryker/issues/2042)) ([9d1fcc1](https://github.com/stryker-mutator/stryker/commit/9d1fcc17e3e8125d8aa9174e3092d4f9913cc656)), closes [#2025](https://github.com/stryker-mutator/stryker/issues/2025)
* **mocha:**  support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)


### Features

* **api:** Document StrykerOptions in JSON schema ([4bdb7a1](https://github.com/stryker-mutator/stryker/commit/4bdb7a18e5ea388a55f00643593ea5efdde1b22f))
* **Dashboard reporter:** upload full html report by default ([#2039](https://github.com/stryker-mutator/stryker/issues/2039)) ([e23dbe1](https://github.com/stryker-mutator/stryker/commit/e23dbe1bcbe5d9b5491ba7c3a1380b4e20ea4c38))
* **HtmlReporter:** include the html reporter in the core package and add it to the default reporters ([#2036](https://github.com/stryker-mutator/stryker/issues/2036)) ([09702d9](https://github.com/stryker-mutator/stryker/commit/09702d9a05387f407d8fc43d21db38b3a14cbec7)), closes [#1919](https://github.com/stryker-mutator/stryker/issues/1919)
* **Reporter.onScoreCalculated:** remove deprecated onScoreCalculatedevent ([#2026](https://github.com/stryker-mutator/stryker/issues/2026)) ([9fa4175](https://github.com/stryker-mutator/stryker/commit/9fa41757d7bed58c98bc3fbd0c8c861670fbd025))


### BREAKING CHANGES

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
* **Dashboard reporter:** The dashboard reporter will now upload a full report by default. If you don't want that, you can disable it with: 

```json
{
  "dashboard": {
    "reportType": "mutationScore"
   }
}
```






# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)


### Features

* **.gitignore:** add Stryker patterns to .gitignore file during initialization ([#1848](https://github.com/stryker-mutator/stryker/issues/1848)) ([854aee0](https://github.com/stryker-mutator/stryker/commit/854aee0))





# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)


### Features

* **excludedMutations:** Implement new naming of mutators ([#1855](https://github.com/stryker-mutator/stryker/issues/1855)) ([c9b3bcb](https://github.com/stryker-mutator/stryker/commit/c9b3bcb))
* **report:** support upload of full report to dashboard ([#1783](https://github.com/stryker-mutator/stryker/issues/1783)) ([fbb8102](https://github.com/stryker-mutator/stryker/commit/fbb8102))





# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/api





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/api





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)


### Features

* **javascript-mutator:** allow to override babel plugins ([#1764](https://github.com/stryker-mutator/stryker/issues/1764)) ([ddb3d60](https://github.com/stryker-mutator/stryker/commit/ddb3d60))
* **mutant-matcher:** lower memory usage ([#1794](https://github.com/stryker-mutator/stryker/issues/1794)) ([16294e5](https://github.com/stryker-mutator/stryker/commit/16294e5))





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

**Note:** Version bump only for package @stryker-mutator/api





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)


### Bug Fixes

* **dispose:** fix race condition in dispose action ([124ef6a](https://github.com/stryker-mutator/stryker/commit/124ef6a)), closes [#1542](https://github.com/stryker-mutator/stryker/issues/1542)





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/api





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Features

* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/api





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/api





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)


### Bug Fixes

* **deps:** add mutation-testing-report-schema ([3d40d91](https://github.com/stryker-mutator/stryker/commit/3d40d91))


### Features

* **reporter:** add `mutationReportReady` event ([044158d](https://github.com/stryker-mutator/stryker/commit/044158d))





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/api





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/api





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/api





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)


### Bug Fixes

* **api:** remove implicit typed inject dependency ([#1399](https://github.com/stryker-mutator/stryker/issues/1399)) ([5cae595](https://github.com/stryker-mutator/stryker/commit/5cae595))





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.24.1...@stryker-mutator/api@1.0.0) (2019-02-13)


### Features

* **config injection:** remove Config from the DI tokens ([#1389](https://github.com/stryker-mutator/stryker/issues/1389)) ([857e4a5](https://github.com/stryker-mutator/stryker/commit/857e4a5))
* **ES5 support:** remove ES5 mutator ([#1370](https://github.com/stryker-mutator/stryker/issues/1370)) ([cb585b4](https://github.com/stryker-mutator/stryker/commit/cb585b4))
* **factories:** remove deprecated factories ([#1381](https://github.com/stryker-mutator/stryker/issues/1381)) ([df2fcdf](https://github.com/stryker-mutator/stryker/commit/df2fcdf))
* **getLogger:** remove getLogger and LoggerFactory from the API ([#1385](https://github.com/stryker-mutator/stryker/issues/1385)) ([cb14e67](https://github.com/stryker-mutator/stryker/commit/cb14e67))
* **port:** remove port config key ([#1386](https://github.com/stryker-mutator/stryker/issues/1386)) ([9c65aa2](https://github.com/stryker-mutator/stryker/commit/9c65aa2))
* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))
* **reporter config:** remove deprecated reporter config option ([#1371](https://github.com/stryker-mutator/stryker/issues/1371)) ([2034a67](https://github.com/stryker-mutator/stryker/commit/2034a67))
* **timeoutMS:** remove deprecated timeoutMs property ([#1382](https://github.com/stryker-mutator/stryker/issues/1382)) ([8d5f682](https://github.com/stryker-mutator/stryker/commit/8d5f682))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker-api -> @stryker-mutator/api
* **config injection:** Remove Config object from Dependency Injection (only relevant for plugin creators).
* **getLogger:** Remove `getLogger` and `LoggerFactory` from the API. Please use dependency injection to inject a logger. See https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md#plugins for more detail
* **port:** Remove the port config key. Ports should be automatically selected.
* **factories:** Remove the Factory (and children) from the stryker-api package. Use DI to ensure classes are created. For more information, see https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md#dependency-injection
* **reporter config:** Remove the 'reporter' config option. Please use the 'reporters' (plural) config option instead.
* **ES5 support:** Remove the ES5 mutator. The 'javascript' mutator is now the default mutator. Users without a mutator plugin should install `@stryker-mutator/javascript-mutator`.
* **timeoutMS:** Remove the 'timeoutMs' config option. Please use the 'timeoutMS' config option instead.





## [0.24.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.24.0...stryker-api@0.24.1) (2019-02-12)


### Bug Fixes

* **mutants:** Prevent memory leak when transpiling mutants ([#1376](https://github.com/stryker-mutator/stryker/issues/1376)) ([45c2852](https://github.com/stryker-mutator/stryker/commit/45c2852)), closes [#920](https://github.com/stryker-mutator/stryker/issues/920)





# [0.24.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.23.0...stryker-api@0.24.0) (2019-02-08)


### Features

* **config-editors:** Remove side effects from all config editor plugins ([#1317](https://github.com/stryker-mutator/stryker/issues/1317)) ([1f61bed](https://github.com/stryker-mutator/stryker/commit/1f61bed))
* **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
* **port:** Deprecate property 'port' ([#1309](https://github.com/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.com/stryker-mutator/stryker/commit/2539ee0))
* **test-frameworks:** Remove side effects from all test-framework plugins  ([#1319](https://github.com/stryker-mutator/stryker/issues/1319)) ([a7160f4](https://github.com/stryker-mutator/stryker/commit/a7160f4))
* **transpilers:** Remove side effects transpiler plugins ([#1351](https://github.com/stryker-mutator/stryker/issues/1351)) ([9a8b539](https://github.com/stryker-mutator/stryker/commit/9a8b539))





<a name="0.23.0"></a>
# [0.23.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.22.1...stryker-api@0.23.0) (2018-12-23)


### Features

* **zero config:** Support mutation testing without any configuration ([#1264](https://github.com/stryker-mutator/stryker/issues/1264)) ([fe8f696](https://github.com/stryker-mutator/stryker/commit/fe8f696))




<a name="0.22.1"></a>
## [0.22.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.22.0...stryker-api@0.22.1) (2018-12-12)




**Note:** Version bump only for package stryker-api

<a name="0.22.0"></a>
# [0.22.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.21.5...stryker-api@0.22.0) (2018-11-29)


### Bug Fixes

* **JestTestRunner:** run jest with --findRelatedTests ([#1235](https://github.com/stryker-mutator/stryker/issues/1235)) ([5e0790e](https://github.com/stryker-mutator/stryker/commit/5e0790e))


### Features

* **console-colors:** Add a global config option to enable/disable colors in console ([#1251](https://github.com/stryker-mutator/stryker/issues/1251)) ([19b1d64](https://github.com/stryker-mutator/stryker/commit/19b1d64))




<a name="0.21.5"></a>
## [0.21.5](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.21.4...stryker-api@0.21.5) (2018-11-13)


### Bug Fixes

* **missing mutator plugin:** set the correct plugin name when the specified mutator cannot be found ([#1234](https://github.com/stryker-mutator/stryker/issues/1234)) ([c2465ec](https://github.com/stryker-mutator/stryker/commit/c2465ec)), closes [#1161](https://github.com/stryker-mutator/stryker/issues/1161)




<a name="0.21.4"></a>
## [0.21.4](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.21.2...stryker-api@0.21.4) (2018-10-15)


### Bug Fixes

* **any-promise:** Don't register a promise implementation ([#1180](https://github.com/stryker-mutator/stryker/issues/1180)) ([1d3e2f6](https://github.com/stryker-mutator/stryker/commit/1d3e2f6))
* **version:** Version bump for failed release ([8cf9e87](https://github.com/stryker-mutator/stryker/commit/8cf9e87))




<a name="0.21.2"></a>
## [0.21.2](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.21.1...stryker-api@0.21.2) (2018-10-03)




**Note:** Version bump only for package stryker-api

<a name="0.21.1"></a>
## [0.21.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.21.0...stryker-api@0.21.1) (2018-09-14)




**Note:** Version bump only for package stryker-api

<a name="0.21.0"></a>
# [0.21.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.20.0...stryker-api@0.21.0) (2018-08-21)


### Features

* **stryker config:** rename config setting `timeoutMs` to `timeoutMS` ([#1099](https://github.com/stryker-mutator/stryker/issues/1099)) ([3ded998](https://github.com/stryker-mutator/stryker/commit/3ded998)), closes [#860](https://github.com/stryker-mutator/stryker/issues/860)




<a name="0.20.0"></a>
# [0.20.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.19.0...stryker-api@0.20.0) (2018-08-19)


### Features

* **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)




<a name="0.19.0"></a>
# [0.19.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.18.0...stryker-api@0.19.0) (2018-08-17)


### Features

* **Command test runner:** Add command test runner ([#1047](https://github.com/stryker-mutator/stryker/issues/1047)) ([ee919fb](https://github.com/stryker-mutator/stryker/commit/ee919fb)), closes [#768](https://github.com/stryker-mutator/stryker/issues/768)




<a name="0.18.0"></a>
# [0.18.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.17.3...stryker-api@0.18.0) (2018-07-20)


### Bug Fixes

* **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)


### Features

* **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)




<a name="0.17.3"></a>
## [0.17.3](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.17.2...stryker-api@0.17.3) (2018-07-04)




**Note:** Version bump only for package stryker-api

<a name="0.17.2"></a>
## [0.17.2](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.17.1...stryker-api@0.17.2) (2018-05-31)




**Note:** Version bump only for package stryker-api

<a name="0.17.1"></a>
## [0.17.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.17.0...stryker-api@0.17.1) (2018-05-21)




**Note:** Version bump only for package stryker-api

<a name="0.17.0"></a>
# [0.17.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.16.1...stryker-api@0.17.0) (2018-04-30)


### Features

* **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))


### BREAKING CHANGES

* **node version:** Node 4 is no longer supported.




<a name="0.16.1"></a>
## [0.16.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.16.0...stryker-api@0.16.1) (2018-04-20)




**Note:** Version bump only for package stryker-api

<a name="0.16.0"></a>
# [0.16.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.15.0...stryker-api@0.16.0) (2018-04-11)


### Features

* **Sandbox isolation:** symbolic link node_modules in sandboxes ([#689](https://github.com/stryker-mutator/stryker/issues/689)) ([487ab7c](https://github.com/stryker-mutator/stryker/commit/487ab7c))




<a name="0.15.0"></a>
# [0.15.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.14.0...stryker-api@0.15.0) (2018-04-04)


### Features

* **Detect files:** create `File` class ([1a89c10](https://github.com/stryker-mutator/stryker/commit/1a89c10))
* **test runner:** add hooks file to test run api ([97be399](https://github.com/stryker-mutator/stryker/commit/97be399))
* **Transpiler api:** change return type of `transpile` to a file array ([e713416](https://github.com/stryker-mutator/stryker/commit/e713416))


### BREAKING CHANGES

* **test runner:** * Promises return types should be `Promise<void>` instead
of `Promise<any>` (typescript compiler error).
* **Detect files:** Remove the `InputFileDescriptor`
interface (breaking for typescript compiler)




<a name="0.14.0"></a>
# [0.14.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.13.1...stryker-api@0.14.0) (2018-03-22)


### Features

* **stryker:** add excludedMutations as a config option ([#13](https://github.com/stryker-mutator/stryker/issues/13)) ([#652](https://github.com/stryker-mutator/stryker/issues/652)) ([cc8a5f1](https://github.com/stryker-mutator/stryker/commit/cc8a5f1))




<a name="0.13.1"></a>
## [0.13.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.13.0...stryker-api@0.13.1) (2018-03-21)




**Note:** Version bump only for package stryker-api

<a name="0.13.0"></a>
# [0.13.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.12.0...stryker-api@0.13.0) (2018-02-07)


### Features

* **coverage analysis:** Support transpiled code ([#559](https://github.com/stryker-mutator/stryker/issues/559)) ([7c351ad](https://github.com/stryker-mutator/stryker/commit/7c351ad))




<a name="0.12.0"></a>
# 0.12.0 (2017-12-21)


### Features

* **cvg analysis:** New coverage instrumenter ([#550](https://github.com/stryker-mutator/stryker/issues/550)) ([2bef577](https://github.com/stryker-mutator/stryker/commit/2bef577))
* **typescript:** Add version check ([#449](https://github.com/stryker-mutator/stryker/issues/449)) ([a780189](https://github.com/stryker-mutator/stryker/commit/a780189)), closes [#437](https://github.com/stryker-mutator/stryker/issues/437)




<a name="0.11.0"></a>
# [0.11.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.10.0...stryker-api@0.11.0) (2017-10-24)


### Features

* **transpiler api:** Async transpiler plugin support ([#433](https://github.com/stryker-mutator/stryker/issues/433)) ([794e587](https://github.com/stryker-mutator/stryker/commit/794e587))




<a name="0.10.0"></a>
## [0.10.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.9.0...stryker-api@0.10.0) (2017-10-20)


### Bug Fixes

* **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)


### BREAKING CHANGES

* **mocha framework:** * Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.




<a name="0.9.0"></a>
# [0.9.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.8.0...stryker-api@0.9.0) (2017-09-19)


### Features

* **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))


### BREAKING CHANGES

* **typescript:** * Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
* Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`.




<a name="0.8.0"></a>
# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.7.0...stryker-api@0.8.0) (2017-08-25)


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.6.0...stryker-api@0.7.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)




<a name="0.6.0"></a>
# [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.5.6...stryker-api@0.6.0) (2017-08-04)


### Features

* **html-reporter:** Score result as single source of truth (#341) ([47b3295](https://github.com/stryker-mutator/stryker/commit/47b3295)), closes [#335](https://github.com/stryker-mutator/stryker/issues/335)




<a name="0.5.6"></a>
## [0.5.6](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.5.5...stryker-api@0.5.6) (2017-07-14)


### Bug Fixes

* **ts-2.4:** Fix type issues for typescript 2.4 (#337) ([c18079b](https://github.com/stryker-mutator/stryker/commit/c18079b)), closes [#337](https://github.com/stryker-mutator/stryker/issues/337)




<a name="0.5.5"></a>
## [0.5.5](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.5.3...stryker-api@0.5.5) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))
* Manual version bump ([a67d90b](https://github.com/stryker-mutator/stryker/commit/a67d90b))




<a name="0.5.2"></a>
## [0.5.2](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.5.1...stryker-api@0.5.2) (2017-06-08)




<a name="0.5.1"></a>
## 0.5.1 (2017-06-02)

### Features

* **report-score-result:** Report score result as tree (#309) ([965c575](https://github.com/stryker-mutator/stryker/commit/965c575))

<a name="0.5.0"></a>
# 0.5.0 (2017-04-21)


### Bug Fixes

* **package.json:** Use stryker repo url (#266) ([de7d1cd](https://github.com/stryker-mutator/stryker/commit/de7d1cd))


### Features

* **multi-package:** Migrate to multi-package repo (#257) ([0c2fde5](https://github.com/stryker-mutator/stryker/commit/0c2fde5))




<a name="0.4.2"></a>
## [0.4.2](https://github.com/stryker-mutator/stryker-api/compare/v0.4.1...v0.4.2) (2016-12-30)


### Bug Fixes

* **config:** Update `files` array type ([#12](https://github.com/stryker-mutator/stryker-api/issues/12)) ([9874730](https://github.com/stryker-mutator/stryker-api/commit/9874730))


### Features

* **report:** Report matched mutants ([#13](https://github.com/stryker-mutator/stryker-api/issues/13)) ([b0e2f6a](https://github.com/stryker-mutator/stryker-api/commit/b0e2f6a))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/stryker-mutator/stryker-api/compare/v0.4.0...v0.4.1) (2016-11-30)


### Features

* **es2015-promise:** Remove dep to es6-promise ([#11](https://github.com/stryker-mutator/stryker-api/issues/11)) ([7042381](https://github.com/stryker-mutator/stryker-api/commit/7042381))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker-api/compare/v0.2.1...v0.4.0) (2016-11-20)


### Features

* **configurable-concurrency:** Add setting for maxConcurrentTestRunners ([731a05b](https://github.com/stryker-mutator/stryker-api/commit/731a05b))
* **configurable-concurrency:** Default value ([32abab2](https://github.com/stryker-mutator/stryker-api/commit/32abab2))
* **mutant-status:** Add `Error` to `MutantStatus` ([#7](https://github.com/stryker-mutator/stryker-api/issues/7)) ([e9df479](https://github.com/stryker-mutator/stryker-api/commit/e9df479))
* **new-api:** Allow for one-pass coverage/test ([#6](https://github.com/stryker-mutator/stryker-api/issues/6)) ([d42c3c7](https://github.com/stryker-mutator/stryker-api/commit/d42c3c7))




<a name="0.2.1"></a>
## 0.2.1 (2016-10-03)

* 0.2.1 ([109d01e](https://github.com/stryker-mutator/stryker-api/commit/109d01e))
* fix(version): Reset version back to 0.2.0 ([50bceb8](https://github.com/stryker-mutator/stryker-api/commit/50bceb8))



<a name="0.3.0-0"></a>
# 0.3.0-0 (2016-09-30)

* 0.3.0-0 ([e73cbba](https://github.com/stryker-mutator/stryker-api/commit/e73cbba))
* feat(ts-2): Upgrade to typescript 2 (#5) ([88a4254](https://github.com/stryker-mutator/stryker-api/commit/88a4254))



<a name="0.2.0"></a>
# 0.2.0 (2016-07-21)

* 0.2.0 ([3410831](https://github.com/stryker-mutator/stryker-api/commit/3410831))
* docs(readme): Add mutator to the list of extensions ([7cef4bd](https://github.com/stryker-mutator/stryker-api/commit/7cef4bd))



<a name="0.1.2"></a>
## 0.1.2 (2016-07-18)

* 0.1.2 ([52f330c](https://github.com/stryker-mutator/stryker-api/commit/52f330c))
* feat(include-comments): Include comments in d-ts files (#2) ([0d2279e](https://github.com/stryker-mutator/stryker-api/commit/0d2279e))
* feat(unincluded-files): Add `include` boolean (#3) ([32d7cdf](https://github.com/stryker-mutator/stryker-api/commit/32d7cdf))



<a name="0.1.1"></a>
## 0.1.1 (2016-07-15)

* 0.1.1 ([e5f039d](https://github.com/stryker-mutator/stryker-api/commit/e5f039d))
* feat(testRunner): Add lifecycle events. (#1) ([94e61c7](https://github.com/stryker-mutator/stryker-api/commit/94e61c7))



<a name="0.1.0"></a>
# 0.1.0 (2016-07-01)

* 0.0.3 ([af5864e](https://github.com/stryker-mutator/stryker-api/commit/af5864e))
* 0.1.0 ([1530de2](https://github.com/stryker-mutator/stryker-api/commit/1530de2))
* docs(readme.md) Update markup ([18f4907](https://github.com/stryker-mutator/stryker-api/commit/18f4907))
* feat(testSelector) Add test selector option to stryker ([79952c3](https://github.com/stryker-mutator/stryker-api/commit/79952c3))



<a name="0.0.2"></a>
## 0.0.2 (2016-06-09)

* docs(build) Add travis build file ([6a7acdb](https://github.com/stryker-mutator/stryker-api/commit/6a7acdb))
* docs(readme) Add stryker logo ([66d45db](https://github.com/stryker-mutator/stryker-api/commit/66d45db))
* fix(TestRunner) Replace TestRunner base class with interface ([8507b89](https://github.com/stryker-mutator/stryker-api/commit/8507b89))
* Initial commit - Basic copy from stryker-mutator/stryker ([e9818e5](https://github.com/stryker-mutator/stryker-api/commit/e9818e5))
* Initial version of the stryker-api ([f7bb9c2](https://github.com/stryker-mutator/stryker-api/commit/f7bb9c2))
* refactor(Factory) Fix typo in error message ([70eec6c](https://github.com/stryker-mutator/stryker-api/commit/70eec6c))
* refactor(package.json) Remove unused dependencies ([b9ba1a4](https://github.com/stryker-mutator/stryker-api/commit/b9ba1a4))
* refactor(report) Rename spec to test as it is more logical in the context of a test report. ([9396c98](https://github.com/stryker-mutator/stryker-api/commit/9396c98))
* test(integration) Add a lot of integration tests ([ed24290](https://github.com/stryker-mutator/stryker-api/commit/ed24290))
