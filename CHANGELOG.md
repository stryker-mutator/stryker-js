# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)


### Bug Fixes

* **deps:** remove vulnerability by updating log4js ([#3372](https://github.com/stryker-mutator/stryker-js/issues/3372)) ([69290f2](https://github.com/stryker-mutator/stryker-js/commit/69290f287f30eee9fac96dc32bd1df2f24180b07)), closes [/github.com/log4js-node/log4js-node/blob/master/CHANGELOG.md#640](https://github.com//github.com/log4js-node/log4js-node/blob/master/CHANGELOG.md/issues/640)
* **mutators:** avoid creating some unnecessary mutations ([#3346](https://github.com/stryker-mutator/stryker-js/issues/3346)) ([0f60ecf](https://github.com/stryker-mutator/stryker-js/commit/0f60ecf2159490d6fa411ea3fa0c3a091fcdd8fa))
* **typescript cheker:** prevent unintentional declarationDir error ([#3358](https://github.com/stryker-mutator/stryker-js/issues/3358)) ([3b510e2](https://github.com/stryker-mutator/stryker-js/commit/3b510e2b28515d325d3583d500743064f5b156a7))





# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)


### Bug Fixes

* **jasmine:** correct peer dependency for jasmine ([#3341](https://github.com/stryker-mutator/stryker-js/issues/3341)) ([07b50a9](https://github.com/stryker-mutator/stryker-js/commit/07b50a922b50fea64c978ab7023f8ea0486d9392))
* **report:** dramatically improve rendering performance of HTML report ([ad38c82](https://github.com/stryker-mutator/stryker-js/commit/ad38c8219ab5cd6dc477b67bf3416c9afdfba972))
* **tsconfig:** force declarationDir false for non-build projects ([#3313](https://github.com/stryker-mutator/stryker-js/issues/3313)) ([461f39c](https://github.com/stryker-mutator/stryker-js/commit/461f39cc0808dbab2ad405a96193aa4586f7f699))


### Features

* **clear-text reporter:** show n/a instead of NaN  ([68c5c51](https://github.com/stryker-mutator/stryker-js/commit/68c5c5183c04ea2cf6b5943996972f4e411e32a9))





## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)


### Bug Fixes

* **ts checker:** always disable `declarationMap` ([#3294](https://github.com/stryker-mutator/stryker-js/issues/3294)) ([990ecdc](https://github.com/stryker-mutator/stryker-js/commit/990ecdcf75ace7ad4553fd7c362d29d9bfa423ce))
* **tsconfig:** rewrite "include" patterns ([#3293](https://github.com/stryker-mutator/stryker-js/issues/3293)) ([37ead22](https://github.com/stryker-mutator/stryker-js/commit/37ead22ff84925418ca7682b3e3a5d2271e7e97f)), closes [#3281](https://github.com/stryker-mutator/stryker-js/issues/3281)





# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)


### Bug Fixes

* **instrumenter:** don't mutate TS generics ([#3268](https://github.com/stryker-mutator/stryker-js/issues/3268)) ([88d6eaf](https://github.com/stryker-mutator/stryker-js/commit/88d6eaff7b9ffab7f45c76e8f348a131798f7671))
* **logging:** don't log log4js category to file as well ([31609a5](https://github.com/stryker-mutator/stryker-js/commit/31609a52d255eb3f174f196f31c13f159c10f774))
* **util:** clear require.cache behavior on case-insensitive file systems ([#3194](https://github.com/stryker-mutator/stryker-js/issues/3194)) ([39e3d86](https://github.com/stryker-mutator/stryker-js/commit/39e3d86238b29e5326b4f741f882cf3665200d1a))


### Features

* **checkers:** allow custom checker node args ([#3179](https://github.com/stryker-mutator/stryker-js/issues/3179)) ([82c4435](https://github.com/stryker-mutator/stryker-js/commit/82c4435e77b5b13aee5a4117a119b4f5dde68c2b))
* **cli:** display suggestions on error ([#3216](https://github.com/stryker-mutator/stryker-js/issues/3216)) ([9ed98e8](https://github.com/stryker-mutator/stryker-js/commit/9ed98e82e5e895ed34afb3f0247cfa29940247a0))
* **config:** Add link to docs when generating a custom config ([#3235](https://github.com/stryker-mutator/stryker-js/issues/3235)) ([7c999b8](https://github.com/stryker-mutator/stryker-js/commit/7c999b8fa5689bb7ed0e299b531add67ee101dc6))
* **hit limit:** infinite loop prevention in jasmine-runner ([#3199](https://github.com/stryker-mutator/stryker-js/issues/3199)) ([bc792e0](https://github.com/stryker-mutator/stryker-js/commit/bc792e087225641256c95f18a6d70fefdca507b5))
* **hit limit:** infinite loop prevention in mocha-runner  ([f5a7d1d](https://github.com/stryker-mutator/stryker-js/commit/f5a7d1d18ec45364743e5aceb71f0f1bbbf3bafa))
* **html:** new diff-view when selecting mutants ([#3263](https://github.com/stryker-mutator/stryker-js/issues/3263)) ([8b253ee](https://github.com/stryker-mutator/stryker-js/commit/8b253ee8ed92d447b5f854e4250f8e1fd064cd13))
* **init:** add buildCommand question when running ([#3213](https://github.com/stryker-mutator/stryker-js/issues/3213)) ([b9d5980](https://github.com/stryker-mutator/stryker-js/commit/b9d5980fbbc69ace8acab404793418a134b2f62f))
* **jest-runner:** support `--findRelatedTests` in dry run ([#3234](https://github.com/stryker-mutator/stryker-js/issues/3234)) ([b2e4584](https://github.com/stryker-mutator/stryker-js/commit/b2e458432483353dd0ea0471b623326ff58c92bc))
* **mutators:** Implement missing AssignmentOperatorMutator  ([#3203](https://github.com/stryker-mutator/stryker-js/issues/3203)) ([95b694b](https://github.com/stryker-mutator/stryker-js/commit/95b694b89430af58ec085bea07883372976fbb02))





## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)


### Bug Fixes

* **instrumenter:** don't break optional chains([#3156](https://github.com/stryker-mutator/stryker-js/issues/3156)) ([95e6b69](https://github.com/stryker-mutator/stryker-js/commit/95e6b69d3267bbda9fdd1ef60350993e05a7dbe7))
* **ProgressReporter:** don't render when there are no valid mutants to render ([#3155](https://github.com/stryker-mutator/stryker-js/issues/3155)) ([41c4177](https://github.com/stryker-mutator/stryker-js/commit/41c4177cdec23a8d054e9b287618889eed3db15e))
* **typescript-checker:** support TS 4.4 ([#3178](https://github.com/stryker-mutator/stryker-js/issues/3178)) ([772e5bc](https://github.com/stryker-mutator/stryker-js/commit/772e5bcb126b4a44024921c31b760d57d92afd94))





# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)


### Features

* **ignore:** support disable directives in source code ([#3072](https://github.com/stryker-mutator/stryker-js/issues/3072)) ([701d8b3](https://github.com/stryker-mutator/stryker-js/commit/701d8b348e2e529e9352d546fab246815e1d7a9a))
* **test runner:** Support for disable bail ([#3074](https://github.com/stryker-mutator/stryker-js/issues/3074)) ([0962232](https://github.com/stryker-mutator/stryker-js/commit/0962232fe2a181a2fde0067ed95f99885b8cee28))





# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)


### Bug Fixes

* **checker:** retry on process crash ([#3059](https://github.com/stryker-mutator/stryker-js/issues/3059)) ([8880643](https://github.com/stryker-mutator/stryker-js/commit/888064313763d907d5f621103955bbc1a788afaf))
* **jest-runner:** load .env for create-react-app ([#3055](https://github.com/stryker-mutator/stryker-js/issues/3055)) ([12e1324](https://github.com/stryker-mutator/stryker-js/commit/12e132410637a9bc4724c4b1fd43acd70f841ce3))
* **node 12:** clear error message for node <12.17 ([#3056](https://github.com/stryker-mutator/stryker-js/issues/3056)) ([9630fc3](https://github.com/stryker-mutator/stryker-js/commit/9630fc3d838adb2c3f47e312239b4ab37cc7b87a))


### Features

* **hit limit:** infinite loop prevention in karma-runner ([#3031](https://github.com/stryker-mutator/stryker-js/issues/3031)) ([fc732fc](https://github.com/stryker-mutator/stryker-js/commit/fc732fce8838c96be2fdf37aff69b12c996d7cb0))
* **report:** show status reason in the html report. ([d777e49](https://github.com/stryker-mutator/stryker-js/commit/d777e49639a2161abc9f9708157409163603874a))





## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)


### Bug Fixes

* **karma runner:** restart a browser on disconnect error ([#3020](https://github.com/stryker-mutator/stryker-js/issues/3020)) ([fc5c449](https://github.com/stryker-mutator/stryker-js/commit/fc5c449ba329d7a8b07d47193d4916cb28d47bb1))
* **mocha-runner:** clear error when require esm ([#3015](https://github.com/stryker-mutator/stryker-js/issues/3015)) ([a835f0b](https://github.com/stryker-mutator/stryker-js/commit/a835f0b57a9084b77a175b5eb14f409651c20c69)), closes [#3014](https://github.com/stryker-mutator/stryker-js/issues/3014)





## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)


### Bug Fixes

* **schema:** Resolve "No 'exports' main" error ([#3004](https://github.com/stryker-mutator/stryker-js/issues/3004)) ([9034806](https://github.com/stryker-mutator/stryker-js/commit/90348066bf3341a669cad67070a61f9dfd58f522))





## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)


### Bug Fixes

* **cucumber:** off-by-one error in report ([#2987](https://github.com/stryker-mutator/stryker-js/issues/2987)) ([5e184c1](https://github.com/stryker-mutator/stryker-js/commit/5e184c1c6d2d4a998ce5f4c2bef48a772e11cebb))


### Features

* **html:** highlight  files in html report ([b7876a4](https://github.com/stryker-mutator/stryker-js/commit/b7876a4c6289e854167d2ed5b2915e16499e0651))
* **mutator:** add the optional chaining mutator  ([#2988](https://github.com/stryker-mutator/stryker-js/issues/2988)) ([43ac767](https://github.com/stryker-mutator/stryker-js/commit/43ac76774d9f5b2bca3f56f99a88f341d6027027))





# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)


### Bug Fixes

* **ignore patterns:** always ignore *.tsbuildinfo files ([#2985](https://github.com/stryker-mutator/stryker-js/issues/2985)) ([794f103](https://github.com/stryker-mutator/stryker-js/commit/794f10390787d1bfa6e4a261315e4bc791790787))


### Features

* **🥒:** add support for cucumber-js test runner ([#2970](https://github.com/stryker-mutator/stryker-js/issues/2970)) ([86d6f79](https://github.com/stryker-mutator/stryker-js/commit/86d6f7998aeb2e0e2265480fd3f75d703e39b3dc))
* **instrumenter:** Implement new mutant placing algorithm ([#2964](https://github.com/stryker-mutator/stryker-js/issues/2964)) ([24b8bc9](https://github.com/stryker-mutator/stryker-js/commit/24b8bc9a15f597d3c5b626dd282d9ecda57f9b32))





## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)


### Bug Fixes

* **peerDeps:** update peer dependencies ([05733d2](https://github.com/stryker-mutator/stryker-js/commit/05733d260d5ffc9eb1b3e284bdc4bc8adafc4d38))





# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)


### Bug Fixes

* **jest-runner:** allow a different rootDir ([b66a617](https://github.com/stryker-mutator/stryker-js/commit/b66a61711a8bea554e29efb8848fa4c9d0afb34c))
* **jest-runner:** use local jest version when jest@<25 ([#2950](https://github.com/stryker-mutator/stryker-js/issues/2950)) ([3218c9e](https://github.com/stryker-mutator/stryker-js/commit/3218c9e57a641866f9b13028c9239af39e7c60a7))


### Features

* **jest-runner:** allow configuration in a custom package.json ([825548c](https://github.com/stryker-mutator/stryker-js/commit/825548c66956ff34c500caadb1ebc2030ef59df3))
* **jest-runner:** dynamically override "testEnvironment" ([#2934](https://github.com/stryker-mutator/stryker-js/issues/2934)) ([0590869](https://github.com/stryker-mutator/stryker-js/commit/05908690cd5fb5c70ff032c6a985bb57bcebb301))
* **jest-runner:** support findRelatedTests for mutated files outside of roots ([#2951](https://github.com/stryker-mutator/stryker-js/issues/2951)) ([19dccec](https://github.com/stryker-mutator/stryker-js/commit/19dcceca950c7c92d08826a4958db73eca7e71dd))
* **mocha-runner:** officially support mocha 9 ([42848bb](https://github.com/stryker-mutator/stryker-js/commit/42848bba288adcefb8d8f8fac1cd34b17bd1d49f))





## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)


### Bug Fixes

* **jest-runner:** Support Jest v27 ([#2861](https://github.com/stryker-mutator/stryker-js/issues/2861)) ([8d3560b](https://github.com/stryker-mutator/stryker-js/commit/8d3560bd2f1b8cbb4235b13dbef9afa84708ac73))
* **mocha-runner:** improve debug logging ([#2925](https://github.com/stryker-mutator/stryker-js/issues/2925)) ([ecc53ee](https://github.com/stryker-mutator/stryker-js/commit/ecc53ee3314f9e4b71aa370f35d87d699471fc55))





# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)


### Bug Fixes

* **sandbox:** make directory if not exists before symlinking node_modules ([#2856](https://github.com/stryker-mutator/stryker-js/issues/2856)) ([40f9a1d](https://github.com/stryker-mutator/stryker-js/commit/40f9a1dfcc49507f28193d6049b08a246baa0ad7))
* **vue-tsx:** support parsing tsx script in .vue file ([#2850](https://github.com/stryker-mutator/stryker-js/issues/2850)) ([dc66c28](https://github.com/stryker-mutator/stryker-js/commit/dc66c28999a548c3c1837dc10d4d38033ae36b1b))


### Features

* **es:** convert to es2019 ([#2846](https://github.com/stryker-mutator/stryker-js/issues/2846)) ([36c687f](https://github.com/stryker-mutator/stryker-js/commit/36c687fd5735e63502db0ad8b8a302f978cd8027))
* **ignore patterns:** add "ignorePatterns" config option ([#2848](https://github.com/stryker-mutator/stryker-js/issues/2848)) ([a69992c](https://github.com/stryker-mutator/stryker-js/commit/a69992cfe5983d94e1dce0dfb367302a42001fe2)), closes [#1593](https://github.com/stryker-mutator/stryker-js/issues/1593) [#2739](https://github.com/stryker-mutator/stryker-js/issues/2739)
* **jest:** report test files and test positions ([#2808](https://github.com/stryker-mutator/stryker-js/issues/2808)) ([c19095e](https://github.com/stryker-mutator/stryker-js/commit/c19095e57f6a46d7d9c9b97f852747d4167ab256))
* **jest-runner:** drop projectType "create-react-app-ts" ([#2788](https://github.com/stryker-mutator/stryker-js/issues/2788)) ([2581e32](https://github.com/stryker-mutator/stryker-js/commit/2581e32435894f47f47ad79f50ca12c3368c6c13)), closes [#2787](https://github.com/stryker-mutator/stryker-js/issues/2787) [#2787](https://github.com/stryker-mutator/stryker-js/issues/2787)
* **mutators:** mutate nullish coalescing operator ([#2884](https://github.com/stryker-mutator/stryker-js/issues/2884)) ([021a419](https://github.com/stryker-mutator/stryker-js/commit/021a4193232318155139ad5df68bf74748fc112c))
* **node:** Drop support for node 10 ([#2879](https://github.com/stryker-mutator/stryker-js/issues/2879)) ([dd29f88](https://github.com/stryker-mutator/stryker-js/commit/dd29f883d384fd29b86a0ef9f78808975657a001))
* **options:** make "perTest" the default for "coverageAnalysis" ([#2881](https://github.com/stryker-mutator/stryker-js/issues/2881)) ([518ebe6](https://github.com/stryker-mutator/stryker-js/commit/518ebe6b946fc35138b636a015b569fe9a272ed0))
* **range:** remove Range from the API ([#2882](https://github.com/stryker-mutator/stryker-js/issues/2882)) ([b578b22](https://github.com/stryker-mutator/stryker-js/commit/b578b22eb9ccdd023602573d5d6e52c49bf99e0f)), closes [#322](https://github.com/stryker-mutator/stryker-js/issues/322)
* **report:** add test details and metadata to JSON report ([#2755](https://github.com/stryker-mutator/stryker-js/issues/2755)) ([acb0a3a](https://github.com/stryker-mutator/stryker-js/commit/acb0a3a3ddf8e82ffbae7212538fd0bba4802944))
* **report:** report test states ([#2868](https://github.com/stryker-mutator/stryker-js/issues/2868)) ([e84aa88](https://github.com/stryker-mutator/stryker-js/commit/e84aa8849d6746ebaa22005423f6f461a67df0a9))
* **reporter api:** unify reporter api with mutation-testing-elements ([#2798](https://github.com/stryker-mutator/stryker-js/issues/2798)) ([d173b27](https://github.com/stryker-mutator/stryker-js/commit/d173b27117ade43e86a991643207532e338e7907)), closes [#2766](https://github.com/stryker-mutator/stryker-js/issues/2766)
* **serialize:** remove surrial ([#2877](https://github.com/stryker-mutator/stryker-js/issues/2877)) ([5114835](https://github.com/stryker-mutator/stryker-js/commit/51148357ed0103ebd6f60259d468bd34e535a4b3))


### BREAKING CHANGES

* **range:** The `range` property is no longer present on a `mutant`. Note, this is a breaking change for plugin creators only.
* **options:** `"perTest"` is now the default value for "coverageAnalysis" when the configured test runner is not "command". Explicitly set `"coverageAnalysis": "off"` manually to opt-out of this behavior.
* **node:** Node 10 is no longer supported. Please use Node 12 or higher.
* **serialize:** Having a non-JSON-serializable value in your configuration won't be sent to the child process anymore. If you really need them in your test runner configuration, you should isolate those values and put them in test runner-specific config files, loaded by the test runner plugin itself, for example, jest.config.js, karma.conf.js, webpack.config.js.
* **ignore patterns:** Stryker will no longer use a git command to determine which files belong to your project. Instead, it will rely on sane defaults. You can change this behavior by defining [`ignorePatterns`](https://stryker-mutator.io/docs/stryker-js/configuration/#ignorepatterns-string).
* **ignore patterns:** The `files` configuration option is deprecated and will be removed in a future release. Please use [`ignorePatterns`](https://stryker-mutator.io/docs/stryker-js/configuration/#ignorepatterns-string) instead.

This:

```json
{
  "files": ["foo.js"]
}
```

Is equivalent to:

```json
{
  "ignorePatterns": ["**", "!foo.js"]
}
```
* **reporter api:** Changes to `Reporter` and `TestRunner` plugin API of Stryker
* **jest-runner:** Support for project type `create-react-app-ts` is dropped from the jest-runner.





# [4.6.0](https://github.com/stryker-mutator/stryker-js/compare/v4.5.1...v4.6.0) (2021-04-16)


### Features

* **mutation range:** allow specifying a mutation range ([#2751](https://github.com/stryker-mutator/stryker-js/issues/2751)) ([84647cf](https://github.com/stryker-mutator/stryker-js/commit/84647cf8c4052dead95d4d23a0e9c0c66e54292c))
* **rename:** rename to StrykerJS ([#2813](https://github.com/stryker-mutator/stryker-js/issues/2813)) ([dc08592](https://github.com/stryker-mutator/stryker-js/commit/dc08592c09c0fe5fcc21db03dc2da4e03713f46b)), closes [#2754](https://github.com/stryker-mutator/stryker-js/issues/2754)





## [4.5.1](https://github.com/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)


### Bug Fixes

* **babel-transformer:** respect top of the file comments/pragma ([#2783](https://github.com/stryker-mutator/stryker/issues/2783)) ([ca42276](https://github.com/stryker-mutator/stryker/commit/ca422764a2ba5552ef34965532e0b9030f110669))
* **instrumenter:** corect mutant location in .vue and .html files ([547a25c](https://github.com/stryker-mutator/stryker/commit/547a25cfa13e89a597c433bb329ee011abe84420)), closes [#2790](https://github.com/stryker-mutator/stryker/issues/2790)
* **peer-deps:** use correct peer dep version ([a6ca0f2](https://github.com/stryker-mutator/stryker/commit/a6ca0f25b29cb84a2cb4b8c05a42e7305d5dde16))





# [4.5.0](https://github.com/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)


### Bug Fixes

* **logging:** log info about symlinking on debug ([#2756](https://github.com/stryker-mutator/stryker/issues/2756)) ([c672e2e](https://github.com/stryker-mutator/stryker/commit/c672e2e0fc27817aae43839f39a166b5b1b9ba07))
* **mutator:** don't mutate string literal object methods ([#2718](https://github.com/stryker-mutator/stryker/issues/2718)) ([964537a](https://github.com/stryker-mutator/stryker/commit/964537a37dece036573f88bace6c714a0413a2e7))
* **reporting:** report test name when a hook fails ([#2757](https://github.com/stryker-mutator/stryker/issues/2757)) ([5e062b2](https://github.com/stryker-mutator/stryker/commit/5e062b2b65a1269b45a66ecc536108aab529abae))
* **typescript-checker:** improve error reporting ([2502eba](https://github.com/stryker-mutator/stryker/commit/2502eba08b0c26c1b91cbd5917092ccd7a89aa7c))
* **typescript-checker:** resolve tsconfig files correctly ([8cf9e8c](https://github.com/stryker-mutator/stryker/commit/8cf9e8c43b7e3817452b32de9461829ed9ad6490))


### Features

* **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))
* **sandbox:** support symlinking of node_modules anywhere ([ee66623](https://github.com/stryker-mutator/stryker/commit/ee666238b29facf512126d6e056037e8ac011260))





## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)


### Bug Fixes

* **jest-runner:** support custom rootDir ([312f6fe](https://github.com/stryker-mutator/stryker/commit/312f6feb6350c6f4027854ab9847006f527fafd2))





# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)


### Bug Fixes

* **child-process:** improve out-of-memory recognition ([#2697](https://github.com/stryker-mutator/stryker/issues/2697)) ([b97220a](https://github.com/stryker-mutator/stryker/commit/b97220a6c810b7ccc1f5fdb6e84be828a58ba1b0))
* **jasmine:** support jasmine >3.6.2 ([#2594](https://github.com/stryker-mutator/stryker/issues/2594)) ([582079b](https://github.com/stryker-mutator/stryker/commit/582079b97dbe7ad2526a6815740d452da66a8617))


### Features

* **in place:** support in place mutation ([#2706](https://github.com/stryker-mutator/stryker/issues/2706)) ([2685a7e](https://github.com/stryker-mutator/stryker/commit/2685a7eb86c808c363aad3151f2c67f273bdf314))
* **regex-mutator:** smart regex mutations ([#2709](https://github.com/stryker-mutator/stryker/issues/2709)) ([0877f44](https://github.com/stryker-mutator/stryker/commit/0877f443219a29c34ac13ca27f33cbf884b5bb4b))





## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package stryker-parent





# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)


### Features

* single file HTML report ([#2540](https://github.com/stryker-mutator/stryker/issues/2540)) ([057f9fd](https://github.com/stryker-mutator/stryker/commit/057f9fdf2b5468e8ea76e8be57475fd58a28b7c4))
* **jest-runner:** support coverage analysis ([#2634](https://github.com/stryker-mutator/stryker/issues/2634)) ([5662e58](https://github.com/stryker-mutator/stryker/commit/5662e581e03ed955d1c851c9d818f0ad4e0d18a8))





# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)


### Bug Fixes

* **arithmatic-mutator:** Don't mutate obvious string concat ([#2648](https://github.com/stryker-mutator/stryker/issues/2648)) ([71f8f9a](https://github.com/stryker-mutator/stryker/commit/71f8f9a6f4f663942c83d64667058d1de3d958a6))
* **CLI help:** remove non-existant logLevel 'all' ([#2626](https://github.com/stryker-mutator/stryker/issues/2626)) ([718a7f2](https://github.com/stryker-mutator/stryker/commit/718a7f2a6947f24f85dd0611e85d27a282ef3eb5))


### Features

* **debugging:** allow passing node args to the test runner ([#2609](https://github.com/stryker-mutator/stryker/issues/2609)) ([fdd95c0](https://github.com/stryker-mutator/stryker/commit/fdd95c0c6abe02201fd4ec914fc97d2cf0adf7d1))
* **jest-runner:** resolve local jest version ([#2623](https://github.com/stryker-mutator/stryker/issues/2623)) ([1466f9a](https://github.com/stryker-mutator/stryker/commit/1466f9a988d11a4c43cd7c97f195b0eacb75c96f))
* **karma-runner:** resolve local karma and ng version ([#2622](https://github.com/stryker-mutator/stryker/issues/2622)) ([5b92130](https://github.com/stryker-mutator/stryker/commit/5b921302787a526377be02a37eb43a487c8f283d))
* **resporter:** add json reporter ([#2582](https://github.com/stryker-mutator/stryker/issues/2582)) ([d18c4aa](https://github.com/stryker-mutator/stryker/commit/d18c4aaa3494931aa4b92eb277254e796d865e51))
* **timeout:** add `--dryRunTimeoutMinutes` option ([494e821](https://github.com/stryker-mutator/stryker/commit/494e8212bdc9bdebde262cf24f4cc5ca53f0fc79))





## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)


### Bug Fixes

* **peerDeps:** update core in peerDependencies ([045dbc3](https://github.com/stryker-mutator/stryker/commit/045dbc3742c123658f4cf9ab2786b20ffd89a8cf))





## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)


### Bug Fixes

* **disable-checking:** allow jest environment ([#2607](https://github.com/stryker-mutator/stryker/issues/2607)) ([26aca66](https://github.com/stryker-mutator/stryker/commit/26aca661dcf02efc7d0d57408d45a02d2a5a4b82))
* **ts:** support es private fields ([#2605](https://github.com/stryker-mutator/stryker/issues/2605)) ([6bd2fbb](https://github.com/stryker-mutator/stryker/commit/6bd2fbbf0aaa5154930ce36f4d153ee91a3c5f1f))





# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)


### Bug Fixes

* **concurrency:** better default for low CPU count ([#2546](https://github.com/stryker-mutator/stryker/issues/2546)) ([eac9199](https://github.com/stryker-mutator/stryker/commit/eac9199428dd1b34df756f55b9a457046b536adf))
* **instrumenter:** add missing case for .jsx files in parser ([#2577](https://github.com/stryker-mutator/stryker/issues/2577)) ([cea94aa](https://github.com/stryker-mutator/stryker/commit/cea94aa90347ab1ff601205014116d41a6bef3f9))
* **string-literal-mutator:** don't mutate class property keys ([#2544](https://github.com/stryker-mutator/stryker/issues/2544)) ([8c8b478](https://github.com/stryker-mutator/stryker/commit/8c8b47819a6f415c0da773888ed7692cf5d76776))


### Features

* **angular:** update Karma config path in Angular preset ([#2548](https://github.com/stryker-mutator/stryker/issues/2548)) ([986acba](https://github.com/stryker-mutator/stryker/commit/986acba1c3aa59130b876f90e29e4925898e70a6))
* **html:** reposition stryker image ([#2593](https://github.com/stryker-mutator/stryker/issues/2593)) ([21d635a](https://github.com/stryker-mutator/stryker/commit/21d635aae0e6392cb7facd9a0974e7fc525f2fb7))
* **HTML reporter:** Dark mode support 🌑 ([#2590](https://github.com/stryker-mutator/stryker/issues/2590)) ([ca9a513](https://github.com/stryker-mutator/stryker/commit/ca9a513c3e2a95337fbca74752408c8372fe5c5d))
* **instrumenter:** update to babel 7.12 ([#2592](https://github.com/stryker-mutator/stryker/issues/2592)) ([300b73f](https://github.com/stryker-mutator/stryker/commit/300b73f60dde87b8780341d1ac6d2d6ab5aeb69e))
* **mocha:** support mocha 8.2 ([#2591](https://github.com/stryker-mutator/stryker/issues/2591)) ([b633629](https://github.com/stryker-mutator/stryker/commit/b63362983477815cde15e20e8453079128b9e609))





# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)


### Bug Fixes

* **instrumenter:** don't mutate generics ([#2530](https://github.com/stryker-mutator/stryker/issues/2530)) ([ed42e3c](https://github.com/stryker-mutator/stryker/commit/ed42e3c222a7bd0f98090a77cfee08db366679a1))
* **presets:** update `init` templates for 4.0 release ([#2526](https://github.com/stryker-mutator/stryker/issues/2526)) ([ec0d75e](https://github.com/stryker-mutator/stryker/commit/ec0d75e968cd2cffc662dd91ea0eee07042f0b3c))





# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)


### Bug Fixes

* **instrumenter:** switch case mutant placer ([#2518](https://github.com/stryker-mutator/stryker/issues/2518)) ([a560711](https://github.com/stryker-mutator/stryker/commit/a560711023990dca950700da18269e78249b5c49))


### Features

* **instrumenter:** add excludedMutations support ([#2513](https://github.com/stryker-mutator/stryker/issues/2513)) ([bfd714f](https://github.com/stryker-mutator/stryker/commit/bfd714fe1b4f9c3b2468164a95d0c5bd0cbc8fcf))





# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)


### Bug Fixes

* **config:** deprecate function based config ([#2499](https://github.com/stryker-mutator/stryker/issues/2499)) ([8ea3c18](https://github.com/stryker-mutator/stryker/commit/8ea3c18421929a0724ff99e5bf02ce0f174266cd))
* **core:** fix "too many open files" ([#2498](https://github.com/stryker-mutator/stryker/issues/2498)) ([5b7c242](https://github.com/stryker-mutator/stryker/commit/5b7c2424dc57b32d390112bcbf8b79bf41c05a11))
* **instrumenter:** only add header when there are mutats ([#2503](https://github.com/stryker-mutator/stryker/issues/2503)) ([8f989cc](https://github.com/stryker-mutator/stryker/commit/8f989cceb8fea5e66e3055a623f238ce85ef1025))
* **mutate config:** don't warn about files not existing at the default mutate location ([#2509](https://github.com/stryker-mutator/stryker/issues/2509)) ([66c2444](https://github.com/stryker-mutator/stryker/commit/66c24447e28c4218d3e58b945b1bcc5891855097)), closes [#2455](https://github.com/stryker-mutator/stryker/issues/2455)
* **shebang:** support shebang in in files ([#2510](https://github.com/stryker-mutator/stryker/issues/2510)) ([7d2dd80](https://github.com/stryker-mutator/stryker/commit/7d2dd80f2c7a89f31c8f96c2e911a6f9beaf7cbc))


### Features

* **core:** add `appendPlugins` command-line option ([#2385](https://github.com/stryker-mutator/stryker/issues/2385)) ([0dec9b8](https://github.com/stryker-mutator/stryker/commit/0dec9b84b07391752af5514f90a2120c4f01d260))
* **core:** correct initial test run timing ([#2496](https://github.com/stryker-mutator/stryker/issues/2496)) ([4f5a37e](https://github.com/stryker-mutator/stryker/commit/4f5a37eb63a4e9532022821dac85d68f8939ceab))
* **jest-runner:** deprecate "create-react-app-ts" ([#2497](https://github.com/stryker-mutator/stryker/issues/2497)) ([0aacc7b](https://github.com/stryker-mutator/stryker/commit/0aacc7be5bb045887e96f0a8115b7e3e46e1a1ff))
* **test-runner:** Add `--maxTestRunnerReuse` support ([5919484](https://github.com/stryker-mutator/stryker/commit/59194841505e520ddc382ea4affc78ef16978e1b))


### BREAKING CHANGES

* **config:** exporting a function from stryker.conf.js is deprecated. Please export your config as an object instead, or use a stryker.conf.json file.

Co-authored-by: Nico Jansen <jansennico@gmail.com>





# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)


### Bug Fixes

* **instrumenter:** ignore `declare` syntax ([b1faa16](https://github.com/stryker-mutator/stryker/commit/b1faa1603f68dded5d694cdb41b6e75b05ac9e1a))


### Features

* **core:** add `--cleanTempDir` cli option ([6ef792c](https://github.com/stryker-mutator/stryker/commit/6ef792c839c0464c7acbeb72560574dc94480eea))
* **instrumenter:** improve placement error ([12e097e](https://github.com/stryker-mutator/stryker/commit/12e097e287d24e41656d2b3897335b3f93654e5d))





# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)


### Bug Fixes

* **core:** allow skipped tests when matching mutants ([#2487](https://github.com/stryker-mutator/stryker/issues/2487)) ([09eacee](https://github.com/stryker-mutator/stryker/commit/09eaceece587e4e583348fbec7682ba77715bd8c)), closes [#2485](https://github.com/stryker-mutator/stryker/issues/2485)
* **instrumenter:** don't mutate constructor blocks with initialized class properties ([#2484](https://github.com/stryker-mutator/stryker/issues/2484)) ([ca464a3](https://github.com/stryker-mutator/stryker/commit/ca464a31e180aada677464591154c41295fbc50c)), closes [#2474](https://github.com/stryker-mutator/stryker/issues/2474)
* **instrumenter:** place mutants in if statements  ([#2481](https://github.com/stryker-mutator/stryker/issues/2481)) ([4df4102](https://github.com/stryker-mutator/stryker/commit/4df410263be09468323d7f64d95a8a839432e52f)), closes [#2469](https://github.com/stryker-mutator/stryker/issues/2469)





# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)


### Bug Fixes

* **instrumenter:** skip `as` expressions ([#2471](https://github.com/stryker-mutator/stryker/issues/2471)) ([2432d84](https://github.com/stryker-mutator/stryker/commit/2432d8442bd783448568a92c57349ecab626def0))





# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)


### Bug Fixes

* **jasmine-runner:** fix memory leaks ([457d807](https://github.com/stryker-mutator/stryker/commit/457d807989bd2a69a9e1b7bc33c3971a37c19737))
* **mocha-runner:** don't allow custom timeout ([#2463](https://github.com/stryker-mutator/stryker/issues/2463)) ([e90b563](https://github.com/stryker-mutator/stryker/commit/e90b5635907dfcd36de98d73fa6c2da31f69fbed))
* **mocha-runner:** fix memory leaks ([23eede2](https://github.com/stryker-mutator/stryker/commit/23eede22036c9efa502af8016e530af780a7cebb))
* **reporters:** correctly report avg tests/mutants ([#2458](https://github.com/stryker-mutator/stryker/issues/2458)) ([582e01b](https://github.com/stryker-mutator/stryker/commit/582e01befe7ce2effdcde86f2c3123ccaff89c18))


### Features

* **mutate:** a new default for `mutate` ([#2452](https://github.com/stryker-mutator/stryker/issues/2452)) ([673516d](https://github.com/stryker-mutator/stryker/commit/673516d3fb92534fc3aad62d17243b558fae3ba4)), closes [#2384](https://github.com/stryker-mutator/stryker/issues/2384)
* **typescript:** Disable type checking ([#2446](https://github.com/stryker-mutator/stryker/issues/2446)) ([3ff996b](https://github.com/stryker-mutator/stryker/commit/3ff996b7516b7782434d86aa9aecbee334978a7f)), closes [#2438](https://github.com/stryker-mutator/stryker/issues/2438)





# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)


### Bug Fixes

* **input files:** support emojis in file names ([#2430](https://github.com/stryker-mutator/stryker/issues/2430)) ([139f9f3](https://github.com/stryker-mutator/stryker/commit/139f9f3ea9aa2349198cb824ceb444f7c6b013b6))
* **input files:** support emojis in file names ([#2433](https://github.com/stryker-mutator/stryker/issues/2433)) ([b5feae2](https://github.com/stryker-mutator/stryker/commit/b5feae2558ade9a1f2d947f7fd046033e4c9d996))


### Features

* **api:** rename test_runner2 -> test_runner ([#2442](https://github.com/stryker-mutator/stryker/issues/2442)) ([4d3ae97](https://github.com/stryker-mutator/stryker/commit/4d3ae9764dbd689c895b76e44f2eea76c82fabc8))
* **jest-runner:** switch mutants using env ([#2416](https://github.com/stryker-mutator/stryker/issues/2416)) ([cad01ba](https://github.com/stryker-mutator/stryker/commit/cad01baf9f4fc3bab2ae5244627586133fb618be))
* **karma-runner:** force bail = true in all cases ([ba928a1](https://github.com/stryker-mutator/stryker/commit/ba928a10d9e4c67ade9648927fb6b281ad2e3d55))
* **options:** deprecate old stryker options ([#2395](https://github.com/stryker-mutator/stryker/issues/2395)) ([7c637c8](https://github.com/stryker-mutator/stryker/commit/7c637c8714169a03facd42a7521f7670b7606a32))
* **reporter-api:** support mutation switching ([67f1ed5](https://github.com/stryker-mutator/stryker/commit/67f1ed52f4d17df4306362064180d267ed5445c7))
* **test-runner:** add `nrOfTests` metric ([0eea448](https://github.com/stryker-mutator/stryker/commit/0eea44892e2383e8b0a34c6267e2f455d604f55a))
* **wct-runner:** drop support for wct ([#2440](https://github.com/stryker-mutator/stryker/issues/2440)) ([7c55424](https://github.com/stryker-mutator/stryker/commit/7c55424a6deca5301af50206ea93905faaa0056b))


### Performance Improvements

* **express:** add benchmark express ([#2431](https://github.com/stryker-mutator/stryker/issues/2431)) ([7cfb8f1](https://github.com/stryker-mutator/stryker/commit/7cfb8f1568530439d8bbf40c87b9ce1ab1fa7e96))


### BREAKING CHANGES

* **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.
* **wct-runner:** The @stryker-mutator/wct-runner package is dropped in Stryker 4.0. Please see https://github.com/stryker-mutator/stryker/issues/2386 for more details. Feel free to keep using @stryker-mutator/wct-runner@3 or start a community fork.  Note that [support for the web-component-tester itself is minimal](https://github.com/Polymer/tools/issues/3398), you might want to consider switching to a different test runner. Stryker still supports Mocha, Jest, Jasmine and Karma.
* **reporter-api:** The `onMutantTested` and `onAllMutantsTested` methods on the `Reporter` api have changed





# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)


### Bug Fixes

* **core:** exit process on error ([#2378](https://github.com/stryker-mutator/stryker/issues/2378)) ([af18a59](https://github.com/stryker-mutator/stryker/commit/af18a590fc916d75d54bcfaf2dda1d6a90bd4df8)), closes [#2315](https://github.com/stryker-mutator/stryker/issues/2315)
* **exit prematurely:** exit when no tests were executed ([#2380](https://github.com/stryker-mutator/stryker/issues/2380)) ([6885e16](https://github.com/stryker-mutator/stryker/commit/6885e16fad7699ba93e6ebbbf0755c7d98c50c5a))
* **instrumenter:** support anonymous function names ([#2388](https://github.com/stryker-mutator/stryker/issues/2388)) ([c7d150a](https://github.com/stryker-mutator/stryker/commit/c7d150ab1af4341bb59381ef55fa54eff0113a11)), closes [#2362](https://github.com/stryker-mutator/stryker/issues/2362)


### Features

* **core:** add ability to override file headers ([#2363](https://github.com/stryker-mutator/stryker/issues/2363)) ([430d6d3](https://github.com/stryker-mutator/stryker/commit/430d6d3d17fe2ad8e2cef3b858afa7efb86c2342))
* **core:** strip comments in sandbox ([#2365](https://github.com/stryker-mutator/stryker/issues/2365)) ([55f27f2](https://github.com/stryker-mutator/stryker/commit/55f27f29b6994096c9aad038958ee93e9fa0f035)), closes [#2364](https://github.com/stryker-mutator/stryker/issues/2364)
* **instrumenter:** add support for `.mjs` and `.cjs` file formats ([#2391](https://github.com/stryker-mutator/stryker/issues/2391)) ([5ba4c5c](https://github.com/stryker-mutator/stryker/commit/5ba4c5c93a721982019aa7e124e491decec2e9f0))
* **jest-runner:** remove deprecated project types ([#2361](https://github.com/stryker-mutator/stryker/issues/2361)) ([d0aa5c3](https://github.com/stryker-mutator/stryker/commit/d0aa5c3c2f676176d3fbceb24ab2cd17011c9ecf))
* **mocha:** deprecate mocha < v6 ([#2379](https://github.com/stryker-mutator/stryker/issues/2379)) ([fee0754](https://github.com/stryker-mutator/stryker/commit/fee0754c395ade4ee92d434963034e59ea5d180d))
* **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)


### BREAKING CHANGES

* **exit prematurely:** Stryker will now exit with exit code 1 when no tests were executed in the initial test run.
* **mocha:** Mocha@<6 is deprecated and support for it will be removed in Stryker v5
* **jest-runner:** Project types `react` and `react-ts` has been removed. Please use `create-react-app` and `create-react-app-ts` respectively





# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)


### Bug Fixes

* **ArrowFunction mutator:** don't mutate () => undefined ([#2313](https://github.com/stryker-mutator/stryker/issues/2313)) ([310145e](https://github.com/stryker-mutator/stryker/commit/310145ec853a56b6520e0358861ba492b5dff0a6))
* **instrumenter:** don't mutate string literals in object properties ([#2354](https://github.com/stryker-mutator/stryker/issues/2354)) ([cd43952](https://github.com/stryker-mutator/stryker/commit/cd439522650fe59c1607d00d58d331b5dc45fe39))
* **mutator:** issue with block statement mutator ([#2342](https://github.com/stryker-mutator/stryker/issues/2342)) ([aaa4ff6](https://github.com/stryker-mutator/stryker/commit/aaa4ff6cd5bdfadef5047ec2c405ad0f385249ef)), closes [#2314](https://github.com/stryker-mutator/stryker/issues/2314)


### Features

* **command:** Support command test runner with mutation switching ([#2345](https://github.com/stryker-mutator/stryker/issues/2345)) ([59b1cfc](https://github.com/stryker-mutator/stryker/commit/59b1cfc06c4f8f5ec1e55dce4823e0f9c384b16c))
* **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))





# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)


### Bug Fixes

* **Jest:** Notify users of lacking Jest support ([#2322](https://github.com/stryker-mutator/stryker/issues/2322)) ([0bbc0c1](https://github.com/stryker-mutator/stryker/commit/0bbc0c119ba5d661ba9751d241ba548293738aa8))





# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)


### Bug Fixes

* **buildCommand:** allow for a single command string in posix ([77b6a20](https://github.com/stryker-mutator/stryker/commit/77b6a209955bb71fffee61919cec6b3a14db2eff))
* **instrumenter:** don't mutate `require` ([963e289](https://github.com/stryker-mutator/stryker/commit/963e28921c48ec2d4113ded0eefde7049fff3263))
* **jasmine-runner:** update deprecated api calls ([#2250](https://github.com/stryker-mutator/stryker/issues/2250)) ([b6d6dfd](https://github.com/stryker-mutator/stryker/commit/b6d6dfdabf8db748660b9818415864de27d55a7f))
* **karma-runner:** mocha filtering with `/` ([#2290](https://github.com/stryker-mutator/stryker/issues/2290)) ([3918633](https://github.com/stryker-mutator/stryker/commit/3918633b21ff37d2e950df2cc14b8557ee7eb6b3))
* **reporter:** report event order ([#2311](https://github.com/stryker-mutator/stryker/issues/2311)) ([ceb73a8](https://github.com/stryker-mutator/stryker/commit/ceb73a83dddce0df1bd1c6b9f7e7e8e75fe77e31))
* **sandbox:** exec build command before symlink ([bd25cd6](https://github.com/stryker-mutator/stryker/commit/bd25cd6ce2f28fe4b1b1b3ac792d99a9742e438b))
* **typescript-checker:** support empty files ([#2310](https://github.com/stryker-mutator/stryker/issues/2310)) ([284a28c](https://github.com/stryker-mutator/stryker/commit/284a28cbe831ad4c4ed161f2d700fa88663120ca))


### Features

* **api:** add id to Mutant interface ([#2255](https://github.com/stryker-mutator/stryker/issues/2255)) ([cfc9053](https://github.com/stryker-mutator/stryker/commit/cfc90537d0b9815cba2b44b9681d171ca602766e))
* **api:** add new test runner api ([#2249](https://github.com/stryker-mutator/stryker/issues/2249)) ([bbbc308](https://github.com/stryker-mutator/stryker/commit/bbbc308806f46260ed0777ea2a33342ec12d105e))
* **api:** remove support for options editors ([5e56d0e](https://github.com/stryker-mutator/stryker/commit/5e56d0ea6982faf11048c8ca4bbb912ee17e88eb))
* **checker:** add checker api ([#2240](https://github.com/stryker-mutator/stryker/issues/2240)) ([d463f86](https://github.com/stryker-mutator/stryker/commit/d463f8639437c114da4fe30115652e8a470dd179)), closes [#1514](https://github.com/stryker-mutator/stryker/issues/1514) [#1980](https://github.com/stryker-mutator/stryker/issues/1980)
* **core:** add support for checker plugins ([#2285](https://github.com/stryker-mutator/stryker/issues/2285)) ([69358e1](https://github.com/stryker-mutator/stryker/commit/69358e1423701c730e29d303119a08d74081f340))
* **core:** support build command ([f71ba87](https://github.com/stryker-mutator/stryker/commit/f71ba87a7adfd85131e1dea5fb1d6f3d8bba76df))
* **html-parser:** add `// [@ts-nocheck](https://github.com/ts-nocheck)` to scripts ([8ceff31](https://github.com/stryker-mutator/stryker/commit/8ceff31aabda981551a5f5997e820fc9af76565d))
* **instrumenter:** add mutant placers ([#2224](https://github.com/stryker-mutator/stryker/issues/2224)) ([0e05025](https://github.com/stryker-mutator/stryker/commit/0e0502523a32ffbe836e93da9ade479b01393c5a))
* **instrumenter:** add parsers ([#2222](https://github.com/stryker-mutator/stryker/issues/2222)) ([3b57ef2](https://github.com/stryker-mutator/stryker/commit/3b57ef23dd5b348dcdff205600989aea2c7fbcf0))
* **instrumenter:** add the mutation testing instrumenter ([#2212](https://github.com/stryker-mutator/stryker/issues/2212)) ([197e177](https://github.com/stryker-mutator/stryker/commit/197e177cb730952b22d3e5929f4799c2bae476d7))
* **instrumenter:** add transformers ([#2234](https://github.com/stryker-mutator/stryker/issues/2234)) ([61c8fe6](https://github.com/stryker-mutator/stryker/commit/61c8fe65e35bb95b786a0e2bebbe57166ffbc480))
* **instrumenter:** allow override of babel plugins ([8758cfd](https://github.com/stryker-mutator/stryker/commit/8758cfdda8ac2bfa761568f55ddee48c2a23f0e0))
* **instrumenter:** implement `Instrumenter` class ([8df9172](https://github.com/stryker-mutator/stryker/commit/8df9172b95b6e277f44302469edb3c00324a02bd))
* **jasmine-runner:** implement new test runner api ([#2256](https://github.com/stryker-mutator/stryker/issues/2256)) ([871db8c](https://github.com/stryker-mutator/stryker/commit/871db8c24c3389133d9b4476acd33b0ddd956a36)), closes [#2249](https://github.com/stryker-mutator/stryker/issues/2249)
* **mutator:** remove `Mutator` API ([3ca89cf](https://github.com/stryker-mutator/stryker/commit/3ca89cf7e23af70f83e0c0ac02ab5241fc0790ff))
* **mutators:** add mutators to instrumenter package ([#2266](https://github.com/stryker-mutator/stryker/issues/2266)) ([3b87743](https://github.com/stryker-mutator/stryker/commit/3b87743645db9923d4c85146ea861aa1b7265447))
* **sandbox:** add ignore header to js files ([#2291](https://github.com/stryker-mutator/stryker/issues/2291)) ([3adde83](https://github.com/stryker-mutator/stryker/commit/3adde830deb8d4b471ae6fceafd603c9750419d7)), closes [#2276](https://github.com/stryker-mutator/stryker/issues/2276)
* **test-framework:** remove `TestFramework` API ([fe5e200](https://github.com/stryker-mutator/stryker/commit/fe5e200e1f7ad7a24ebceacb2a62c2be58ce6a4f))
* **transpiler:** remove `Transpiler` API ([06f668b](https://github.com/stryker-mutator/stryker/commit/06f668bf8660f78b12916b2236f3fd9bf86bf23b))
* **tsconfig:** rewrite tsconfig references ([#2292](https://github.com/stryker-mutator/stryker/issues/2292)) ([4ee4950](https://github.com/stryker-mutator/stryker/commit/4ee4950bebd8db9c2f5a514edee57de55c040526)), closes [#2276](https://github.com/stryker-mutator/stryker/issues/2276)
* **typescript-checker:** a typescript type checker plugin ([#2241](https://github.com/stryker-mutator/stryker/issues/2241)) ([42adb95](https://github.com/stryker-mutator/stryker/commit/42adb9561cdd10172f955fda044854bcc1b7b515)), closes [/github.com/stryker-mutator/stryker/blob/f44008993a543dc3f38ca99516f56d315fdcb735/packages/typescript/src/transpiler/TranspilingLanguageService.ts#L23](https://github.com//github.com/stryker-mutator/stryker/blob/f44008993a543dc3f38ca99516f56d315fdcb735/packages/typescript/src/transpiler/TranspilingLanguageService.ts/issues/L23) [#391](https://github.com/stryker-mutator/stryker/issues/391)


### BREAKING CHANGES

* **core:** * `--maxConcurrentTestRunners` is now deprecated. Please use `--concurrency` instead.





## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)


### Bug Fixes

* **validation:** don't warn about the commandRunner options ([2128b9a](https://github.com/stryker-mutator/stryker/commit/2128b9ad5addb5617847234be2f7f34195671661))





# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)


### Features

* **mocha-runner:** support mocha 8 ([#2259](https://github.com/stryker-mutator/stryker/issues/2259)) ([917d965](https://github.com/stryker-mutator/stryker/commit/917d965e72871a2199dd9b2d710d40b350509431))





## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)


### Bug Fixes

* **ts:** support ts 3.9 on windows in the typescript-transpiler ([#2215](https://github.com/stryker-mutator/stryker/issues/2215)) ([0fab74f](https://github.com/stryker-mutator/stryker/commit/0fab74f4af97e6faf0eee0ba44f935af7c4ccbb5))





## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)


### Bug Fixes

* **init:** use correct schema reference ([#2213](https://github.com/stryker-mutator/stryker/issues/2213)) ([136f538](https://github.com/stryker-mutator/stryker/commit/136f538c17140196b88ccaf80d3082546262a4e8))





## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)


### Bug Fixes

* **options:** resolve false positives in unknown options warning ([#2208](https://github.com/stryker-mutator/stryker/issues/2208)) ([e3905f6](https://github.com/stryker-mutator/stryker/commit/e3905f6a4efa5aa32c4d76d09bff4692a35e78a9))





## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)


### Bug Fixes

* remove duplicate package.json script ([#2198](https://github.com/stryker-mutator/stryker/issues/2198)) ([26beff2](https://github.com/stryker-mutator/stryker/commit/26beff22129c0e07e716a88ae513999949ded5ed))





# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)


### Bug Fixes

* **utils:** make sure `instanceof StrykerError` works ([a9dea8c](https://github.com/stryker-mutator/stryker/commit/a9dea8c638a61bd472e937b69bf37846074e09a1))
* **webpack-transpiler:** add support for cache-loader ([#2196](https://github.com/stryker-mutator/stryker/issues/2196)) ([0bcf98b](https://github.com/stryker-mutator/stryker/commit/0bcf98ba78a7a7923f53ccf75fdf4638fba62193))


### Features

* **api:** Deprecated Config in favor of StrykerOptions ([dccdd91](https://github.com/stryker-mutator/stryker/commit/dccdd9119743d776e2dc4b572a9e02b1524ef88b))
* **api:** export the StrykerOptions JSON schema ([0bb222d](https://github.com/stryker-mutator/stryker/commit/0bb222db07638ecf196eba9d8c88e086cd15239f))
* **init:** add reference to mono schema ([#2162](https://github.com/stryker-mutator/stryker/issues/2162)) ([61953c7](https://github.com/stryker-mutator/stryker/commit/61953c703631619b51442298e1cff8532c336d4a))
* **Jest:** support overriding config ([#2197](https://github.com/stryker-mutator/stryker/issues/2197)) ([d37b7d7](https://github.com/stryker-mutator/stryker/commit/d37b7d724fea7a62d93613d9579defbfdffcd180)), closes [#2155](https://github.com/stryker-mutator/stryker/issues/2155)
* **validation:**  validate StrykerOptions using JSON schema ([5f05665](https://github.com/stryker-mutator/stryker/commit/5f0566581abdd1229dfe5d27a25a676bec93d8f8))
* **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))
* **validation:** hide stacktrace on validation error ([8c5ee88](https://github.com/stryker-mutator/stryker/commit/8c5ee889c7b06569bbfeb6a9557b8cecda16f0eb))
* **validation:** warn about unknown stryker config options ([#2164](https://github.com/stryker-mutator/stryker/issues/2164)) ([8c6fd97](https://github.com/stryker-mutator/stryker/commit/8c6fd972dc57e246d361132dc176920d380c91cc)), closes [#2103](https://github.com/stryker-mutator/stryker/issues/2103)






# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)


### Bug Fixes

* **api:** allow for different api versions of File ([#2124](https://github.com/stryker-mutator/stryker/issues/2124)) ([589de85](https://github.com/stryker-mutator/stryker/commit/589de85361297999c8b5625e800783a18e6507e5))


### Features

* **mocha:** support mocha 7 ([#2114](https://github.com/stryker-mutator/stryker/issues/2114)) ([4a4d677](https://github.com/stryker-mutator/stryker/commit/4a4d677d8dd291cd063ed6b887d4d702f31e84d1)), closes [#2108](https://github.com/stryker-mutator/stryker/issues/2108)





## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)


### Bug Fixes

* **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))





## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)


### Bug Fixes

* **Peer dependencies:** set peer dependencies for v3 ([#2096](https://github.com/stryker-mutator/stryker/issues/2096)) ([8648c4d](https://github.com/stryker-mutator/stryker/commit/8648c4d9c70ce032841371c6041ebb76bf099948)), closes [#2095](https://github.com/stryker-mutator/stryker/issues/2095)





# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)


### Bug Fixes

* **api:** allow for different api versions of File ([#2042](https://github.com/stryker-mutator/stryker/issues/2042)) ([9d1fcc1](https://github.com/stryker-mutator/stryker/commit/9d1fcc17e3e8125d8aa9174e3092d4f9913cc656)), closes [#2025](https://github.com/stryker-mutator/stryker/issues/2025)
* **mocha:**  support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)


### Features

* **api:** Document StrykerOptions in JSON schema ([4bdb7a1](https://github.com/stryker-mutator/stryker/commit/4bdb7a18e5ea388a55f00643593ea5efdde1b22f))
* **config:** Allow a `stryker.conf.json` as default config file. ([#2092](https://github.com/stryker-mutator/stryker/issues/2092)) ([2279813](https://github.com/stryker-mutator/stryker/commit/2279813dec4f9fabbfe9dcd521dc2e19d5902dc6))
* **core:** exit code 1 when error in initial run ([49c5162](https://github.com/stryker-mutator/stryker/commit/49c5162461b5240a6c4204305cb21a7dd74d5172))
* **Dashboard reporter:** upload full html report by default ([#2039](https://github.com/stryker-mutator/stryker/issues/2039)) ([e23dbe1](https://github.com/stryker-mutator/stryker/commit/e23dbe1bcbe5d9b5491ba7c3a1380b4e20ea4c38))
* **excludedMutations:** remove deprecated mutation names ([#2027](https://github.com/stryker-mutator/stryker/issues/2027)) ([6f7bfe1](https://github.com/stryker-mutator/stryker/commit/6f7bfe13e8ec681d73c97d9b7fbd3f88a313ed6d))
* **HtmlReporter:** include the html reporter in the core package and add it to the default reporters ([#2036](https://github.com/stryker-mutator/stryker/issues/2036)) ([09702d9](https://github.com/stryker-mutator/stryker/commit/09702d9a05387f407d8fc43d21db38b3a14cbec7)), closes [#1919](https://github.com/stryker-mutator/stryker/issues/1919)
* **Initializer:** Initialize config file as JSON by default ([#2093](https://github.com/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.com/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.com/stryker-mutator/stryker/issues/2000)
* **jest-runner:** support Jest 25 ([b45e872](https://github.com/stryker-mutator/stryker/commit/b45e8725fe19b3568e0d358d4a6add32bafed425)), closes [#1983](https://github.com/stryker-mutator/stryker/issues/1983)
* **karma-runner:** disable client.clearContext  ([#2048](https://github.com/stryker-mutator/stryker/issues/2048)) ([27c0787](https://github.com/stryker-mutator/stryker/commit/27c0787e1b5e9b886dc530afcb0de19637e308c6))
* **karma-runner:** use ChromeHeadless as the default browser ([#2035](https://github.com/stryker-mutator/stryker/issues/2035)) ([18bf9b6](https://github.com/stryker-mutator/stryker/commit/18bf9b603fdc0b4b0049c32dfaf953603980a662))
* **promisified fs:** use node 10 promisified functions ([#2028](https://github.com/stryker-mutator/stryker/issues/2028)) ([1c57d8f](https://github.com/stryker-mutator/stryker/commit/1c57d8f4620c2392e167f45fa20aa6acbd0c7a7d))
* **react:** change react to create-react-app ([#1978](https://github.com/stryker-mutator/stryker/issues/1978)) ([7f34f28](https://github.com/stryker-mutator/stryker/commit/7f34f28dda821da561ae7ea5d041bb58fca4c011))
* **Reporter.onScoreCalculated:** remove deprecated onScoreCalculatedevent ([#2026](https://github.com/stryker-mutator/stryker/issues/2026)) ([9fa4175](https://github.com/stryker-mutator/stryker/commit/9fa41757d7bed58c98bc3fbd0c8c861670fbd025))


### BREAKING CHANGES

* **core:** Stryker now exists with exitCode `1` if an error of any kind occurs.
* **karma-runner:** The @stryker-mutator/karma-runner will now use ChromeHeadless by default (instead of PhantomJS)
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
* **arrow mutations:** add arrow mutations and refactor JavaScript mutators ([#1898](https://github.com/stryker-mutator/stryker/issues/1898)) ([898d38b](https://github.com/stryker-mutator/stryker/commit/898d38b))
* **TypeScript mutator:** mutate Array constructor calls without the new keyword ([#1903](https://github.com/stryker-mutator/stryker/issues/1903)) ([aecd944](https://github.com/stryker-mutator/stryker/commit/aecd944)), closes [#1902](https://github.com/stryker-mutator/stryker/issues/1902)





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
* **perf/angular-cli:** upgrade to latest angular version and fix bugs ([#1842](https://github.com/stryker-mutator/stryker/issues/1842)) ([4f81550](https://github.com/stryker-mutator/stryker/commit/4f81550))


### Features

* **babel-transpiler:** support object-style babel.config.js ([#1762](https://github.com/stryker-mutator/stryker/issues/1762)) ([31410c8](https://github.com/stryker-mutator/stryker/commit/31410c8))





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package stryker-parent





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)


### Bug Fixes

* edge cases, duplication, log output ([#1720](https://github.com/stryker-mutator/stryker/issues/1720)) ([7f42d34](https://github.com/stryker-mutator/stryker/commit/7f42d34))
* **jest-runner:** improve error message for missing react-scripts ([#1694](https://github.com/stryker-mutator/stryker/issues/1694)) ([313e3bf](https://github.com/stryker-mutator/stryker/commit/313e3bf))
* **tempDir:** don't resolve temp dir as input file ([#1710](https://github.com/stryker-mutator/stryker/issues/1710)) ([bbdd02a](https://github.com/stryker-mutator/stryker/commit/bbdd02a))


### Features

* **javascript-mutator:** allow to override babel plugins ([#1764](https://github.com/stryker-mutator/stryker/issues/1764)) ([ddb3d60](https://github.com/stryker-mutator/stryker/commit/ddb3d60))
* **mutant-matcher:** lower memory usage ([#1794](https://github.com/stryker-mutator/stryker/issues/1794)) ([16294e5](https://github.com/stryker-mutator/stryker/commit/16294e5))
* **progress-reporter:** show timed out mutant count ([#1818](https://github.com/stryker-mutator/stryker/issues/1818)) ([067df6d](https://github.com/stryker-mutator/stryker/commit/067df6d))
* **typescript:** do not mutate `interfaces` ([#1662](https://github.com/stryker-mutator/stryker/issues/1662)) ([86b2ffe](https://github.com/stryker-mutator/stryker/commit/86b2ffe))





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

* **html:** set utf-8 charset ([#1592](https://github.com/stryker-mutator/stryker/issues/1592)) ([fb858ca](https://github.com/stryker-mutator/stryker/commit/fb858ca))
* **inquirer:** fix inquirer types ([#1563](https://github.com/stryker-mutator/stryker/issues/1563)) ([37ca23c](https://github.com/stryker-mutator/stryker/commit/37ca23c))





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Bug Fixes

* **vue:** only mutate Vue files with <script> blocks ([#1540](https://github.com/stryker-mutator/stryker/issues/1540)) ([ee4d27c](https://github.com/stryker-mutator/stryker/commit/ee4d27c))


### Features

* **deps:** update source-map dep to current major release ([45fa0f8](https://github.com/stryker-mutator/stryker/commit/45fa0f8))
* **es2017:** output es2017 code ([#1518](https://github.com/stryker-mutator/stryker/issues/1518)) ([e85561e](https://github.com/stryker-mutator/stryker/commit/e85561e))
* **formatting:** remove dependency on prettier ([#1552](https://github.com/stryker-mutator/stryker/issues/1552)) ([24543d3](https://github.com/stryker-mutator/stryker/commit/24543d3)), closes [#1261](https://github.com/stryker-mutator/stryker/issues/1261)
* **mocha:** deprecate mocha version 5 and below ([#1529](https://github.com/stryker-mutator/stryker/issues/1529)) ([1c55350](https://github.com/stryker-mutator/stryker/commit/1c55350))
* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **es2017:** changed TypeScript output target from es5 to es2017. This requires a NodeJS runtime of version 8 or higher.
* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.
* **mocha:** the use of mocha version 5 and below is deprecated. Please upgrade to mocha 6 or above. See [their changelog](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#600--2019-02-18) for more information about upgrading.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)


### Bug Fixes

* **clean up:** prevent sandbox creation after dispose ([#1527](https://github.com/stryker-mutator/stryker/issues/1527)) ([73fc0a8](https://github.com/stryker-mutator/stryker/commit/73fc0a8))





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)


### Bug Fixes

* **dispose:** clean up child processes in alternative flows ([#1520](https://github.com/stryker-mutator/stryker/issues/1520)) ([31ee085](https://github.com/stryker-mutator/stryker/commit/31ee085))
* **html:** load report json from a js file ([#1485](https://github.com/stryker-mutator/stryker/issues/1485)) ([9bee2a7](https://github.com/stryker-mutator/stryker/commit/9bee2a7)), closes [#1482](https://github.com/stryker-mutator/stryker/issues/1482)


### Features

* **javascript-mutator:** allow decorators ([#1474](https://github.com/stryker-mutator/stryker/issues/1474)) ([f0dd430](https://github.com/stryker-mutator/stryker/commit/f0dd430))
* **mocha 6:** support all config formats ([#1511](https://github.com/stryker-mutator/stryker/issues/1511)) ([baa374d](https://github.com/stryker-mutator/stryker/commit/baa374d))





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)


### Bug Fixes

* **deps:** add mutation-testing-report-schema ([3d40d91](https://github.com/stryker-mutator/stryker/commit/3d40d91))
* **typescript:** don't mutate `declare` statements ([#1458](https://github.com/stryker-mutator/stryker/issues/1458)) ([aae3afe](https://github.com/stryker-mutator/stryker/commit/aae3afe))


### Features

* **babel-transpiler:** support .js babel config files ([#1422](https://github.com/stryker-mutator/stryker/issues/1422)) ([9e321f0](https://github.com/stryker-mutator/stryker/commit/9e321f0))
* **html-reporter:** use mutation-testing-elements ([2f6df38](https://github.com/stryker-mutator/stryker/commit/2f6df38))
* **peer-dep:** update stryker core to v1.2 ([d798b19](https://github.com/stryker-mutator/stryker/commit/d798b19))
* **reporter:** add `mutationReportReady` event ([044158d](https://github.com/stryker-mutator/stryker/commit/044158d))
* **reporter:** implement `mutationTestReport` ([16ba76b](https://github.com/stryker-mutator/stryker/commit/16ba76b))





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)


### Bug Fixes

* **broadcast-reporter:** log error detail ([#1461](https://github.com/stryker-mutator/stryker/issues/1461)) ([2331847](https://github.com/stryker-mutator/stryker/commit/2331847))





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)


### Bug Fixes

* **duplicate files:** make transpile always result in unique file names ([#1405](https://github.com/stryker-mutator/stryker/issues/1405)) ([a3018d2](https://github.com/stryker-mutator/stryker/commit/a3018d2))
* **presets:** install v1.x dependencies instead of v0.x ([#1434](https://github.com/stryker-mutator/stryker/issues/1434)) ([7edda46](https://github.com/stryker-mutator/stryker/commit/7edda46))


### Features

* **jest-runner:** disable notifications ([#1419](https://github.com/stryker-mutator/stryker/issues/1419)) ([948166b](https://github.com/stryker-mutator/stryker/commit/948166b))





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)


### Bug Fixes

* **jest-runner:** mark 'todo' tests as skipped ([#1420](https://github.com/stryker-mutator/stryker/issues/1420)) ([26d813f](https://github.com/stryker-mutator/stryker/commit/26d813f))





## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)


### Bug Fixes

* **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)


### Bug Fixes

* **api:** remove implicit typed inject dependency ([#1399](https://github.com/stryker-mutator/stryker/issues/1399)) ([5cae595](https://github.com/stryker-mutator/stryker/commit/5cae595))
