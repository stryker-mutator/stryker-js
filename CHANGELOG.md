# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
