# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.0.0](https://github.com/stryker-mutator/stryker-js/compare/v7.3.0...v8.0.0) (2023-11-30)

### Bug Fixes

- **core:** short circuit test executor when no tests and allowEmpty ([#4477](https://github.com/stryker-mutator/stryker-js/issues/4477)) ([ce3e5cd](https://github.com/stryker-mutator/stryker-js/commit/ce3e5cdd2c3abcf4576fad485f6f86b11895caf1))
- **deps:** update dependency @cucumber/messages to v23 ([#4540](https://github.com/stryker-mutator/stryker-js/issues/4540)) ([0472118](https://github.com/stryker-mutator/stryker-js/commit/047211879320c15f4ddb18878c0681198e06070b))
- **deps:** update dependency angular-html-parser to v5 ([#4533](https://github.com/stryker-mutator/stryker-js/issues/4533)) ([fb5a167](https://github.com/stryker-mutator/stryker-js/commit/fb5a1671304b007ee3c6a85f11415d36257f6122))
- **deps:** update dependency emoji-regex to v10 ([#4496](https://github.com/stryker-mutator/stryker-js/issues/4496)) ([418688b](https://github.com/stryker-mutator/stryker-js/commit/418688b8095afa380e72e4e5453155b84dc9d96d))
- **deps:** update dependency tap-parser to ~15.3.0 ([#4492](https://github.com/stryker-mutator/stryker-js/issues/4492)) ([5ababb3](https://github.com/stryker-mutator/stryker-js/commit/5ababb3dc68eff28d38ff09c3d46cd10453a3dff))
- **deps:** update mutation-testing-elements monorepo to v2.0.5 ([#4536](https://github.com/stryker-mutator/stryker-js/issues/4536)) ([45e3ae6](https://github.com/stryker-mutator/stryker-js/commit/45e3ae62427ea59dd5ddd42016ecf93b6ecf7e44))
- **jest-runner:** support `handleTestEvent` class property ([#4623](https://github.com/stryker-mutator/stryker-js/issues/4623)) ([23f557d](https://github.com/stryker-mutator/stryker-js/commit/23f557d824f03a532e4e2d065710663eab2cda2f))

### Features

- **init:** add svelte custom initializer ([#4625](https://github.com/stryker-mutator/stryker-js/issues/4625)) ([418722d](https://github.com/stryker-mutator/stryker-js/commit/418722dfe9155b3db531b5f580edb8d267c6ab38))
- **node:** drop official support for node 16 ([#4542](https://github.com/stryker-mutator/stryker-js/issues/4542)) ([e190207](https://github.com/stryker-mutator/stryker-js/commit/e190207e25926179c1a3ed2c0ff97a13720c57bd))
- **svelte:** support mutating `.svelte` files ([0ef9a7f](https://github.com/stryker-mutator/stryker-js/commit/0ef9a7f5045799c39f7c6312c73a8d0345236615))
- **vitest:** support browser mode ([#4628](https://github.com/stryker-mutator/stryker-js/issues/4628)) ([3d02969](https://github.com/stryker-mutator/stryker-js/commit/3d0296914e455fd3a1fa754ffa4711368af036c0))

### BREAKING CHANGES

- **node:** NodeJS 16 is no longer supported. Please use NodeJS 18 or higher. See https://nodejs.org/en/about/previous-releases

# [7.3.0](https://github.com/stryker-mutator/stryker-js/compare/v7.2.0...v7.3.0) (2023-10-15)

### Bug Fixes

- **core:** disableTypeChecks true only forces ts-like file match ([#4485](https://github.com/stryker-mutator/stryker-js/issues/4485)) ([31f3411](https://github.com/stryker-mutator/stryker-js/commit/31f3411276e1251863fb0bb874353e5a3fab32a6))
- **cucumber:** support cucumber 10 ([74c75b6](https://github.com/stryker-mutator/stryker-js/commit/74c75b65f808b214ebf3bebfe1635dbe8f4b467b))
- **deps:** update dependency commander to ~11.1.0 ([#4483](https://github.com/stryker-mutator/stryker-js/issues/4483)) ([ab03c0d](https://github.com/stryker-mutator/stryker-js/commit/ab03c0d32562dac46e7b2eac2a3c6aa7d2f7a8ac))
- **deps:** update dependency tap-parser to v15 ([#4457](https://github.com/stryker-mutator/stryker-js/issues/4457)) ([f3f16c3](https://github.com/stryker-mutator/stryker-js/commit/f3f16c3848f37e87a8bdbfe23a8af7acdd016253))
- **package:** don't publish test and tsbuildinfo. ([#4464](https://github.com/stryker-mutator/stryker-js/issues/4464)) ([ae3d2d8](https://github.com/stryker-mutator/stryker-js/commit/ae3d2d8f6bd92be73dface5cc7e08589872a4d60))

### Features

- **Ignorer plugin:** support ignorer plugins ([#4487](https://github.com/stryker-mutator/stryker-js/issues/4487)) ([4fe1000](https://github.com/stryker-mutator/stryker-js/commit/4fe10004881e8a46ca6ac32d957b069c70910686))
- **plugin:** add support for `declareValuePlugin` ([#4490](https://github.com/stryker-mutator/stryker-js/issues/4490)) ([a3c35ca](https://github.com/stryker-mutator/stryker-js/commit/a3c35caa3b2dba7036e1ebf081c74fa594f88d03))

# [7.2.0](https://github.com/stryker-mutator/stryker-js/compare/v7.1.1...v7.2.0) (2023-10-02)

### Bug Fixes

- **deps:** update dependency execa to v7.2.0 ([#4384](https://github.com/stryker-mutator/stryker-js/issues/4384)) ([d3da2d4](https://github.com/stryker-mutator/stryker-js/commit/d3da2d49fafd793bd0f652497f1b3894767e8bf4))
- **deps:** update dependency execa to v8 ([#4456](https://github.com/stryker-mutator/stryker-js/issues/4456)) ([47a3483](https://github.com/stryker-mutator/stryker-js/commit/47a34838d6cab2a6cdfd09b4689a5116c0302a76))
- **deps:** update dependency tslib to v2.6.2 ([#4380](https://github.com/stryker-mutator/stryker-js/issues/4380)) ([ad03cf6](https://github.com/stryker-mutator/stryker-js/commit/ad03cf6603bc72b235a67dd65744ddfa9ad0352c))
- **deps:** update mutation-testing-elements monorepo to v2.0.3 ([#4399](https://github.com/stryker-mutator/stryker-js/issues/4399)) ([2aa1f54](https://github.com/stryker-mutator/stryker-js/commit/2aa1f542f738512899ead0304200fc0c48250892))
- **npm package:** ignore unused files ([#4405](https://github.com/stryker-mutator/stryker-js/issues/4405)) ([f14e789](https://github.com/stryker-mutator/stryker-js/commit/f14e78944652ceccd205ca1541465292e758c565))

### Features

- **config:** allow suffix 'config' to config filename ([#4308](https://github.com/stryker-mutator/stryker-js/issues/4308)) ([fc8596e](https://github.com/stryker-mutator/stryker-js/commit/fc8596e1e4d53b0f9343f7bf2b3ee1f5e89f19d4))
- **reporter:** configurable clear-text reporter ([#4330](https://github.com/stryker-mutator/stryker-js/issues/4330)) ([74bcc74](https://github.com/stryker-mutator/stryker-js/commit/74bcc74b7fe4ea661c6b466e40f6b88dfdc8320a))
- **string mutations:** don't mutate Symbol descriptions ([#4407](https://github.com/stryker-mutator/stryker-js/issues/4407)) ([bdd0d5c](https://github.com/stryker-mutator/stryker-js/commit/bdd0d5c96c51371f347c06d66555ff255aaf3a6e))

## [7.1.1](https://github.com/stryker-mutator/stryker-js/compare/v7.1.0...v7.1.1) (2023-07-15)

### Bug Fixes

- **deps:** update dependency chalk to v5 ([#4343](https://github.com/stryker-mutator/stryker-js/issues/4343)) ([ed265e5](https://github.com/stryker-mutator/stryker-js/commit/ed265e55d14ecefea876c62c9408ba688849545f))
- **deps:** update dependency tslib to v2.6.0 ([#4335](https://github.com/stryker-mutator/stryker-js/issues/4335)) ([e4c00ef](https://github.com/stryker-mutator/stryker-js/commit/e4c00ef9cddcc72b1bf0df5f10893933caaed7ef))
- **tap:** use custom time spent logic as fallback ([#4358](https://github.com/stryker-mutator/stryker-js/issues/4358)) ([354a660](https://github.com/stryker-mutator/stryker-js/commit/354a660a5b3eebfe4f84029f26e31dbe223f2bf5))

### Features

- **ci:** add npm package provenance ([cf5d4d0](https://github.com/stryker-mutator/stryker-js/commit/cf5d4d04ee24a1e2b65c1f7ae35dbc840edbd48a))
- **vitest-runner:** Support JSDOM ([#4359](https://github.com/stryker-mutator/stryker-js/issues/4359)) ([cef1689](https://github.com/stryker-mutator/stryker-js/commit/cef1689c173f161622f8de2fbaa34e4abecc8bd4))

# [7.1.0](https://github.com/stryker-mutator/stryker-js/compare/v7.0.2...v7.1.0) (2023-06-24)

### Bug Fixes

- **deps:** update dependency commander to v11 ([#4304](https://github.com/stryker-mutator/stryker-js/issues/4304)) ([f9d5673](https://github.com/stryker-mutator/stryker-js/commit/f9d567383584929da43b8dec99d4ac9b2762cb11))
- **deps:** update dependency glob to v10.3.0 ([#4321](https://github.com/stryker-mutator/stryker-js/issues/4321)) ([72615b6](https://github.com/stryker-mutator/stryker-js/commit/72615b66517ab053df040a6cfbecc20da478e8b6))
- **vitest:** allow `dispose` without `init` ([#4284](https://github.com/stryker-mutator/stryker-js/issues/4284)) ([55464e0](https://github.com/stryker-mutator/stryker-js/commit/55464e0ec975667899847d9e8c08c42610cde014))
- **vitest:** harden against forgotten `await` ([#4319](https://github.com/stryker-mutator/stryker-js/issues/4319)) ([441b645](https://github.com/stryker-mutator/stryker-js/commit/441b6451bf72a7d3ca8deb1e6daa15f3846b1d59))

### Features

- **init:** use registry.npmjs.com for queries ([#4298](https://github.com/stryker-mutator/stryker-js/issues/4298)) ([a952edf](https://github.com/stryker-mutator/stryker-js/commit/a952edf7795aecc8119215d1a8662c61b917dc0b))
- **init:** use vitest runner for vue projects ([#4327](https://github.com/stryker-mutator/stryker-js/issues/4327)) ([ab7313d](https://github.com/stryker-mutator/stryker-js/commit/ab7313d113b8144e25401e33c3f29b1b82e5db45))
- **tap-runner:** add forceBail configuration option ([#4326](https://github.com/stryker-mutator/stryker-js/issues/4326)) ([55a5357](https://github.com/stryker-mutator/stryker-js/commit/55a5357b4f6f1973123eed73fe0465cf3abd3d14))
- **tap-runner:** allow custom node arguments ([#4283](https://github.com/stryker-mutator/stryker-js/issues/4283)) ([5ef0edd](https://github.com/stryker-mutator/stryker-js/commit/5ef0edd2ccf3d409e8c5d0747edd09071de43f09))
- **vitest-runner:** add `"dir"` config option ([#4329](https://github.com/stryker-mutator/stryker-js/issues/4329)) ([eb06075](https://github.com/stryker-mutator/stryker-js/commit/eb06075c27b05a64b76156bd3a67d1e7cee6959b))
- **vitest:** set NODE_ENV to test ([#4290](https://github.com/stryker-mutator/stryker-js/issues/4290)) ([40033f6](https://github.com/stryker-mutator/stryker-js/commit/40033f62e23c00c079cc58c1e6adadf57536b8df))

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

### Bug Fixes

- **config:** regression in import options ([#4277](https://github.com/stryker-mutator/stryker-js/issues/4277)) ([0e9b997](https://github.com/stryker-mutator/stryker-js/commit/0e9b997b489554f02b038fb9d5072a55c373ecd2))
- **deps:** update dependency get-port to v7 ([#4260](https://github.com/stryker-mutator/stryker-js/issues/4260)) ([c9d384c](https://github.com/stryker-mutator/stryker-js/commit/c9d384c5894cf22c61eb108629a3caf7a77208e4))
- **deps:** update dependency tslib to v2.5.3 ([#4255](https://github.com/stryker-mutator/stryker-js/issues/4255)) ([8084d15](https://github.com/stryker-mutator/stryker-js/commit/8084d15ded945958ac3b5b27935cc2f3822f5bc8))
- **tap:** log command to run on debug ([#4263](https://github.com/stryker-mutator/stryker-js/issues/4263)) ([dd8b53d](https://github.com/stryker-mutator/stryker-js/commit/dd8b53db86dac08bcc01d6851c7df1554579f6c6))

## [7.0.1](https://github.com/stryker-mutator/stryker-js/compare/v7.0.0...v7.0.1) (2023-06-03)

### Bug Fixes

- **deps:** update `@stryker-mutator/core` peer dep ([9dd4a76](https://github.com/stryker-mutator/stryker-js/commit/9dd4a767d30830861a3e997266a6491fae799acd))

# [7.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.4.2...v7.0.0) (2023-06-02)

### Bug Fixes

- **core:** improve no-mutate warning ([#4248](https://github.com/stryker-mutator/stryker-js/issues/4248)) ([6bf7a56](https://github.com/stryker-mutator/stryker-js/commit/6bf7a565bff2c730ed70ad64e5432de2d503864a))
- **deps:** update babel monorepo ([#4233](https://github.com/stryker-mutator/stryker-js/issues/4233)) ([a8f2c1e](https://github.com/stryker-mutator/stryker-js/commit/a8f2c1e364a611982a2c3f12b6be32a4a2f2ffec))
- **deps:** update dependency @cucumber/messages to v22 ([#4091](https://github.com/stryker-mutator/stryker-js/issues/4091)) ([ad6f82b](https://github.com/stryker-mutator/stryker-js/commit/ad6f82b525fde969a18a0d3c1a82cf2ee6b0a0c3))
- **deps:** update dependency inquirer to ~9.2.0 ([#4137](https://github.com/stryker-mutator/stryker-js/issues/4137)) ([d985780](https://github.com/stryker-mutator/stryker-js/commit/d9857800c94002b87d399d126160a777318e5daa))
- **deps:** update dependency minimatch to v8 ([#4079](https://github.com/stryker-mutator/stryker-js/issues/4079)) ([af4a62c](https://github.com/stryker-mutator/stryker-js/commit/af4a62cb750648d23e1e7a2e64fbb5ba5ae6cc47))
- **deps:** update dependency mutation-testing-elements to v2 ([#4148](https://github.com/stryker-mutator/stryker-js/issues/4148)) ([50071e6](https://github.com/stryker-mutator/stryker-js/commit/50071e6448656fbc55a0c62d38779056a5847b97))
- **deps:** update dependency semver to v7.4.0 ([#4101](https://github.com/stryker-mutator/stryker-js/issues/4101)) ([c317294](https://github.com/stryker-mutator/stryker-js/commit/c3172941d5c8718f589fdaad9746033c1cf7e6fc))
- **deps:** update dependency semver to v7.5.0 ([#4121](https://github.com/stryker-mutator/stryker-js/issues/4121)) ([4c8dade](https://github.com/stryker-mutator/stryker-js/commit/4c8dade076b18d9e4792fef2028d4b0c93ea27bb))
- **deps:** update dependency tap-parser to v13 ([#4116](https://github.com/stryker-mutator/stryker-js/issues/4116)) ([161f099](https://github.com/stryker-mutator/stryker-js/commit/161f0993ca20a25619e262969deb1cd27633d0d4))
- **deps:** update dependency tslib to v2.5.2 ([#4241](https://github.com/stryker-mutator/stryker-js/issues/4241)) ([4cd2a86](https://github.com/stryker-mutator/stryker-js/commit/4cd2a86503a243fd2998bc72245b8bda00d30d49))
- **deps:** update dependency weapon-regex to ~1.1.0 ([#4102](https://github.com/stryker-mutator/stryker-js/issues/4102)) ([899ae6e](https://github.com/stryker-mutator/stryker-js/commit/899ae6effae0fd4cf9cec3b71a7c75e078005082))
- **deps:** update mutation-testing-elements monorepo to v2.0.1 ([#4182](https://github.com/stryker-mutator/stryker-js/issues/4182)) ([c1b7312](https://github.com/stryker-mutator/stryker-js/commit/c1b7312a238b67f43630101b084ff33780eda1c5))
- **deps:** update mutation-testing-metrics and mutation-report-schema to v2 ([#4154](https://github.com/stryker-mutator/stryker-js/issues/4154)) ([9b77a3f](https://github.com/stryker-mutator/stryker-js/commit/9b77a3f6fdeb7036b1e15610f03dd8c85a502670))
- **incremental:** correctly identify removed test files ([#4134](https://github.com/stryker-mutator/stryker-js/issues/4134)) ([7342ac6](https://github.com/stryker-mutator/stryker-js/commit/7342ac6cb4b6c09207e9ba84da5c85a24bcc62f4))
- **instrumenter:** Use `globalThis` when available ([#4169](https://github.com/stryker-mutator/stryker-js/issues/4169)) ([7d1e58e](https://github.com/stryker-mutator/stryker-js/commit/7d1e58eb150237c102c3a3a7ad0044e5031ce07e))
- **Reporter API:** use 1-based locations with `onMutantTested` ([#4158](https://github.com/stryker-mutator/stryker-js/issues/4158)) ([f5227e0](https://github.com/stryker-mutator/stryker-js/commit/f5227e0907efcc7433dbc93848f1f9057fb86978))
- **tap-runner:** add `glob` as a dependency ([#4225](https://github.com/stryker-mutator/stryker-js/issues/4225)) ([ba6bb7e](https://github.com/stryker-mutator/stryker-js/commit/ba6bb7ebc02e1f08c4f4fa29af0961555ead6510))
- **vitest:** explicitly error when browser-mode is enabled ([#4243](https://github.com/stryker-mutator/stryker-js/issues/4243)) ([e70ff30](https://github.com/stryker-mutator/stryker-js/commit/e70ff3044a60f98cf03f2c5c593b58f43e595d62))
- **vitest:** use cwd for communication dir ([#4217](https://github.com/stryker-mutator/stryker-js/issues/4217)) ([736d97c](https://github.com/stryker-mutator/stryker-js/commit/736d97c39e3191a5acbc7ab012c31d2971345267))

### chore

- **esm:** use "exports" and module "Node16" ([#4171](https://github.com/stryker-mutator/stryker-js/issues/4171)) ([cdf4a34](https://github.com/stryker-mutator/stryker-js/commit/cdf4a342b73d922423eb46a919eb3b38c4c43c46))

### Features

- **config:** add `--allowEmpty` option ([#4198](https://github.com/stryker-mutator/stryker-js/issues/4198)) ([44e355e](https://github.com/stryker-mutator/stryker-js/commit/44e355ee727bbceff1a4069055844c49c0ea2118))
- **config:** add `'always'` option to `cleanTempDir` ([#4187](https://github.com/stryker-mutator/stryker-js/issues/4187)) ([f02efb2](https://github.com/stryker-mutator/stryker-js/commit/f02efb2db08d13be132c0bd318dfa6d3f6399788))
- **mutations:** add Math method expression mutants ([#4076](https://github.com/stryker-mutator/stryker-js/issues/4076)) ([b281163](https://github.com/stryker-mutator/stryker-js/commit/b28116359eb1557fa157a296d04105b3751d1a69))
- **node:** Drop support for node 14 ([#4105](https://github.com/stryker-mutator/stryker-js/issues/4105)) ([a88744f](https://github.com/stryker-mutator/stryker-js/commit/a88744f1a5fa47274ee0f30abc635831b18113fa))
- **reporter-api:** remove `onAllMutantsTested` ([#4234](https://github.com/stryker-mutator/stryker-js/issues/4234)) ([762c023](https://github.com/stryker-mutator/stryker-js/commit/762c023e5ac0ae6e2967be0458663c41d31e82ea))
- **TAP runner:** add support for the node TAP runner ([371baf0](https://github.com/stryker-mutator/stryker-js/commit/371baf07fe8fd47935829c8a38ddc50861614ee4))
- **tap-runner:** support `"nodeArgs"` ([#4235](https://github.com/stryker-mutator/stryker-js/issues/4235)) ([c149b34](https://github.com/stryker-mutator/stryker-js/commit/c149b346ec0e5146dd303cbda245ce7827aef5e2))
- **tap:** allow multiple patterns for `testFiles` ([#4253](https://github.com/stryker-mutator/stryker-js/issues/4253)) ([76b53f1](https://github.com/stryker-mutator/stryker-js/commit/76b53f122d8a8c65fc2f4037171656f22ac2a64b))
- **type-checking:** disable type check by default ([#4246](https://github.com/stryker-mutator/stryker-js/issues/4246)) ([d45350a](https://github.com/stryker-mutator/stryker-js/commit/d45350ad2440d455b7ba215aae1f87712e22fdc5))
- **vitest:** support `bail` ([#4239](https://github.com/stryker-mutator/stryker-js/issues/4239)) ([6b2eb4d](https://github.com/stryker-mutator/stryker-js/commit/6b2eb4d6ede903f3f1abeea821fa994f1983ae4c))
- **vitest:** support vitest test runner ([7394e95](https://github.com/stryker-mutator/stryker-js/commit/7394e95ff27361c39755a60b53ba0839080cadfc))

### BREAKING CHANGES

- **type-checking:** `disableTypeChecks` is now `true` by default. You can use this configuration to opt out:

```json
{
  "disableTypeChecks": "{test,src,lib}/**/*.{js,ts,jsx,tsx,html,vue,cts,mts}"
}
```

- **reporter-api:** The event `onAllMutantsTested` has been removed. Plugin creators should use `onMutationTestReportReady` instead.
- **esm:** Deep (and undocumented) imports from `@stryker-mutator/core` or one of the plugins will no longer work. If you want to import something that's not available, please let us know by [opening an issue](https://github.com/stryker-mutator/stryker-js/issues/new/choose)
- **node:** Node 14 is no longer supported. Please install an LTS version of node: nodejs.org/

## [6.4.2](https://github.com/stryker-mutator/stryker-js/compare/v6.4.1...v6.4.2) (2023-03-24)

### Bug Fixes

- **angular:** generate karma.conf.js file when it is missing ([#4054](https://github.com/stryker-mutator/stryker-js/issues/4054)) ([915c6d8](https://github.com/stryker-mutator/stryker-js/commit/915c6d85db5cbe8a5276e18cd3a07e399d604cfa))
- **cucumber:** officially support cucumber 9 ([#4041](https://github.com/stryker-mutator/stryker-js/issues/4041)) ([e4f10d1](https://github.com/stryker-mutator/stryker-js/commit/e4f10d10a750c92831b1d025dcccdc7fe24527b2))
- **deps:** update dependency execa to v7.1.1 ([#4025](https://github.com/stryker-mutator/stryker-js/issues/4025)) ([13bc0b5](https://github.com/stryker-mutator/stryker-js/commit/13bc0b56cf5c02a17429d805ddd1bf9f5f77725b))
- **deps:** update dependency log4js to ~6.9.0 ([#3988](https://github.com/stryker-mutator/stryker-js/issues/3988)) ([fca777f](https://github.com/stryker-mutator/stryker-js/commit/fca777f40185cbcbc3cd2b7bff7652a56823324c))
- **instrumenter:** replace deprecated method call ([#4023](https://github.com/stryker-mutator/stryker-js/issues/4023)) ([c14800a](https://github.com/stryker-mutator/stryker-js/commit/c14800aa58add9cea6c2bd8700c21507a381cb8a))
- **progress reporter:** improve ETC prediction ([#4024](https://github.com/stryker-mutator/stryker-js/issues/4024)) ([956bbe9](https://github.com/stryker-mutator/stryker-js/commit/956bbe9a7ae3afb2e339f9027fe553c428c0c195)), closes [#4018](https://github.com/stryker-mutator/stryker-js/issues/4018)

## [6.4.1](https://github.com/stryker-mutator/stryker-js/compare/v6.4.0...v6.4.1) (2023-02-17)

### Bug Fixes

- **deps:** set correct stryker peer dep version ([c88c537](https://github.com/stryker-mutator/stryker-js/commit/c88c537c61d03e50362e98e9dddc7569b0c88200))

# [6.4.0](https://github.com/stryker-mutator/stryker-js/compare/v6.3.1...v6.4.0) (2023-02-17)

### Bug Fixes

- **deps:** update dependency angular-html-parser to v4 ([#3925](https://github.com/stryker-mutator/stryker-js/issues/3925)) ([f62c645](https://github.com/stryker-mutator/stryker-js/commit/f62c645f22a2cb5b3d87f5ffad7139db8367fe8c))
- **deps:** update dependency commander to v10 ([#3936](https://github.com/stryker-mutator/stryker-js/issues/3936)) ([e8af5a4](https://github.com/stryker-mutator/stryker-js/commit/e8af5a4f8388c5ad9bf0e3c113b350239215b749))
- **deps:** update dependency execa to v7 ([#3975](https://github.com/stryker-mutator/stryker-js/issues/3975)) ([6c36120](https://github.com/stryker-mutator/stryker-js/commit/6c361206520f0f22e9b3576ff0e3e3e2ac014b7d))
- **deps:** update dependency glob to ~8.1.0 ([#3945](https://github.com/stryker-mutator/stryker-js/issues/3945)) ([edb767a](https://github.com/stryker-mutator/stryker-js/commit/edb767a20df6e3acf203492106caf642749e37bb))
- **deps:** update dependency mkdirp to v2 ([#3946](https://github.com/stryker-mutator/stryker-js/issues/3946)) ([0ee9018](https://github.com/stryker-mutator/stryker-js/commit/0ee901820868562f979a60ae3623b6ebc3c2b3a4))
- **deps:** update dependency mutation-testing-elements to v1.7.14 ([#3969](https://github.com/stryker-mutator/stryker-js/issues/3969)) ([2f3f481](https://github.com/stryker-mutator/stryker-js/commit/2f3f4819935fa03313d33afa32fd0af229eaa5ca))
- **deps:** update dependency mutation-testing-metrics to v1.7.14 ([#3970](https://github.com/stryker-mutator/stryker-js/issues/3970)) ([ddf32ee](https://github.com/stryker-mutator/stryker-js/commit/ddf32ee7581cc6169390022f933f593b7049bd3e))
- **deps:** update dependency mutation-testing-report-schema to v1.7.14 ([#3971](https://github.com/stryker-mutator/stryker-js/issues/3971)) ([a0d5743](https://github.com/stryker-mutator/stryker-js/commit/a0d57431e3a3c8b29ef53a9ef80f46aaf2900678))
- **deps:** update dependency tslib to ~2.5.0 ([#3952](https://github.com/stryker-mutator/stryker-js/issues/3952)) ([7548287](https://github.com/stryker-mutator/stryker-js/commit/7548287ee000bc09f88e6f1f0848e6e8e625bbb5))
- **project reader:** ignore configured output files by default. ([#3894](https://github.com/stryker-mutator/stryker-js/issues/3894)) ([2ff2f07](https://github.com/stryker-mutator/stryker-js/commit/2ff2f07b37007a359f453f987563877bc831beaf))

### Features

- **typescript checker:** group mutants to improve performance 🚀 ([#3900](https://github.com/stryker-mutator/stryker-js/issues/3900)) ([2f4adaa](https://github.com/stryker-mutator/stryker-js/commit/2f4adaa1eedbf70bd9385d15d3f6025027350cc6))

## [6.3.1](https://github.com/stryker-mutator/stryker-js/compare/v6.3.0...v6.3.1) (2022-12-18)

### Bug Fixes

- **deps:** update babel monorepo to ~7.20.0 ([#3810](https://github.com/stryker-mutator/stryker-js/issues/3810)) ([cd1c962](https://github.com/stryker-mutator/stryker-js/commit/cd1c96264fd52ff97182a1d0bc044401e7807044))
- **deps:** update dependency @cucumber/messages to v20 ([#3858](https://github.com/stryker-mutator/stryker-js/issues/3858)) ([29939c3](https://github.com/stryker-mutator/stryker-js/commit/29939c3a1a384db88dc91d95050c4a0903b879ff))
- **deps:** update dependency angular-html-parser to v3 ([#3869](https://github.com/stryker-mutator/stryker-js/issues/3869)) ([39d6381](https://github.com/stryker-mutator/stryker-js/commit/39d6381c9c347edc66b27c1009bb406d89018b1b))
- **deps:** update dependency chalk to ~5.2.0 ([#3898](https://github.com/stryker-mutator/stryker-js/issues/3898)) ([c325272](https://github.com/stryker-mutator/stryker-js/commit/c3252726204b1ad4b3e28a64c12a5c48f0a6cd7e))
- **diff:** last test generation ([#3910](https://github.com/stryker-mutator/stryker-js/issues/3910)) ([f88b038](https://github.com/stryker-mutator/stryker-js/commit/f88b03811001f2e393134c51b1603b315d892ecb))
- **disable-comment:** log a warning when a specified mutator doesn't exist([#3842](https://github.com/stryker-mutator/stryker-js/issues/3842)) ([fe79d49](https://github.com/stryker-mutator/stryker-js/commit/fe79d49cbdf414bce007799c8930ec3a506fed6c))

# [6.3.0](https://github.com/stryker-mutator/stryker-js/compare/v6.2.3...v6.3.0) (2022-10-30)

### Bug Fixes

- **deps:** update dependency angular-html-parser to ~2.1.0 ([#3797](https://github.com/stryker-mutator/stryker-js/issues/3797)) ([33eb2b1](https://github.com/stryker-mutator/stryker-js/commit/33eb2b1e2cb5915ea85ec02fe2a9e41b6f58d8d0))
- **deps:** update dependency chalk to ~5.1.0 ([#3773](https://github.com/stryker-mutator/stryker-js/issues/3773)) ([973dc7b](https://github.com/stryker-mutator/stryker-js/commit/973dc7ba88a8d3af1a9dab212aaa9e6820eb3bea))
- **jest-runner:** automatically set `NODE_ENV` env variable ([#3816](https://github.com/stryker-mutator/stryker-js/issues/3816)) ([9fc7a6f](https://github.com/stryker-mutator/stryker-js/commit/9fc7a6f64b27cdb67e6844ce00f6e55c630d0cd6))
- **jest:** support more config file formats ([#3761](https://github.com/stryker-mutator/stryker-js/issues/3761)) ([7d42139](https://github.com/stryker-mutator/stryker-js/commit/7d421394fcdaab6222cc6e55662e94a3abe94e79))
- **karma-runner:** support zero-mutant runs ([#3787](https://github.com/stryker-mutator/stryker-js/issues/3787)) ([c6a9219](https://github.com/stryker-mutator/stryker-js/commit/c6a9219017b509241d6388654e93896d98cc31aa))

### Features

- **ci:** forbid `.only` in CI pipeline tests ([#3823](https://github.com/stryker-mutator/stryker-js/issues/3823)) ([051ec93](https://github.com/stryker-mutator/stryker-js/commit/051ec937809468751a74c9e01cacd27ceb1acca2))
- **clear-text reporter:** add `allowEmojis` option in console ([#3820](https://github.com/stryker-mutator/stryker-js/issues/3820)) ([79cc05f](https://github.com/stryker-mutator/stryker-js/commit/79cc05fe867f0edf9d2b84f7e89435855e874d1a))
- **core:** add `--dryRunOnly` CLI argument to only run initial tests ([#3814](https://github.com/stryker-mutator/stryker-js/issues/3814)) ([f2cf7e6](https://github.com/stryker-mutator/stryker-js/commit/f2cf7e6141802f04a5de836000b949de8632b567))
- **core:** add support for pnpm as package manager ([#3802](https://github.com/stryker-mutator/stryker-js/issues/3802)) ([af0e34e](https://github.com/stryker-mutator/stryker-js/commit/af0e34e63734ddf1b506f0c5fce40ee8eae6566f))
- **disableTypeChecks:** add option 'true' to disable all type checks ([#3765](https://github.com/stryker-mutator/stryker-js/issues/3765)) ([3c3d298](https://github.com/stryker-mutator/stryker-js/commit/3c3d2988c616a8bb8e7cdb76d4c16ddb948a3011))
- **init:** document test runner homepage url in stryker.conf.json ([#3817](https://github.com/stryker-mutator/stryker-js/issues/3817)) ([92c0852](https://github.com/stryker-mutator/stryker-js/commit/92c0852606c0db4380dd806e07eee55bfea7a4de))
- **worker:** add worker count env variable to processes ([#3821](https://github.com/stryker-mutator/stryker-js/issues/3821)) ([efb6fd6](https://github.com/stryker-mutator/stryker-js/commit/efb6fd64df78dcae020b540c6283406bcd06b783))

## [6.2.3](https://github.com/stryker-mutator/stryker-js/compare/v6.2.2...v6.2.3) (2022-10-10)

### Bug Fixes

- **deps:** update dependency angular-html-parser to v2 ([#3760](https://github.com/stryker-mutator/stryker-js/issues/3760)) ([8dc667e](https://github.com/stryker-mutator/stryker-js/commit/8dc667e203a02a4bb4a4addbaed9053ff275c7f6))
- **deps:** update dependency log4js to ~6.7.0 ([#3758](https://github.com/stryker-mutator/stryker-js/issues/3758)) ([535311d](https://github.com/stryker-mutator/stryker-js/commit/535311dca610f54ecd55d75a59b436dcdf0f8e95))
- **jest:** support multiple jest installations ([#3781](https://github.com/stryker-mutator/stryker-js/issues/3781)) ([9f10e20](https://github.com/stryker-mutator/stryker-js/commit/9f10e20e95e6a0d0b22ba7b4f4df2c1e9ca79a56))

## [6.2.2](https://github.com/stryker-mutator/stryker-js/compare/v6.2.1...v6.2.2) (2022-09-06)

**Note:** Version bump only for package stryker-parent

## [6.2.1](https://github.com/stryker-mutator/stryker-js/compare/v6.2.0...v6.2.1) (2022-09-06)

### Bug Fixes

- **mutant-placing:** regression in optional chain ([#3718](https://github.com/stryker-mutator/stryker-js/issues/3718)) ([1228619](https://github.com/stryker-mutator/stryker-js/commit/1228619afd85449e35c466a75d71bb94636f091e))

# [6.2.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0) (2022-09-06)

### Bug Fixes

- **deps:** update babel monorepo to ~7.19.0 ([#3716](https://github.com/stryker-mutator/stryker-js/issues/3716)) ([edc1ae0](https://github.com/stryker-mutator/stryker-js/commit/edc1ae0644c320ca8dda58686f0b02b5ca0cb908))
- **deps:** update dependency log4js to ~6.6.0 ([#3628](https://github.com/stryker-mutator/stryker-js/issues/3628)) ([201bba2](https://github.com/stryker-mutator/stryker-js/commit/201bba23bad2abe6f9bc66dbd88f614bb4433137))
- **json-report:** make all file paths relative in report ([#3617](https://github.com/stryker-mutator/stryker-js/issues/3617)) ([d51f1a9](https://github.com/stryker-mutator/stryker-js/commit/d51f1a9d0e7cc705f6938fe509411623958210e9))
- **mutant placing:** computed member expressions ([#3713](https://github.com/stryker-mutator/stryker-js/issues/3713)) ([e6ee245](https://github.com/stryker-mutator/stryker-js/commit/e6ee245120252d1294deb8c5aa3e7df20e5249a5))
- **regex:** support unicode regex flags([#3642](https://github.com/stryker-mutator/stryker-js/issues/3642)) ([fcf3a6b](https://github.com/stryker-mutator/stryker-js/commit/fcf3a6beb852dddec2c4f3e32ed72dd4fcb4cd98)), closes [#3579](https://github.com/stryker-mutator/stryker-js/issues/3579)
- **typescript:** support TS v4.8 ([#3700](https://github.com/stryker-mutator/stryker-js/issues/3700)) ([f6b8ff4](https://github.com/stryker-mutator/stryker-js/commit/f6b8ff46558692a76f478b62ffdd659b27c4d626))

### Features

- **incremental:** add incremental mode ([#3609](https://github.com/stryker-mutator/stryker-js/issues/3609)) ([82bea56](https://github.com/stryker-mutator/stryker-js/commit/82bea5604c81c1ccf76d44827ad3922cfb61463b))

# [6.2.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0-beta.0) (2022-06-28)

### Features

- **incremental:** add incremental mode ([04cf8a2](https://github.com/stryker-mutator/stryker-js/commit/04cf8a2f87fea5ebe941a1357636389193d7dc13))

## [6.1.2](https://github.com/stryker-mutator/stryker-js/compare/v6.1.1...v6.1.2) (2022-06-28)

**Note:** Version bump only for package stryker-parent

## [6.1.1](https://github.com/stryker-mutator/stryker-js/compare/v6.1.0...v6.1.1) (2022-06-28)

**Note:** Version bump only for package stryker-parent

# [6.1.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.2...v6.1.0) (2022-06-27)

### Bug Fixes

- **deps:** update dependency @cucumber/messages to v18 ([#3554](https://github.com/stryker-mutator/stryker-js/issues/3554)) ([596347e](https://github.com/stryker-mutator/stryker-js/commit/596347e85ebe5472cddafd4920c600613c98e2b9))
- **deps:** update dependency @cucumber/messages to v19 ([#3559](https://github.com/stryker-mutator/stryker-js/issues/3559)) ([969fb1d](https://github.com/stryker-mutator/stryker-js/commit/969fb1d862ea7bdb9cf495551b6ed688a3f796ac))
- **deps:** update dependency commander to ~9.3.0 ([#3546](https://github.com/stryker-mutator/stryker-js/issues/3546)) ([1142f11](https://github.com/stryker-mutator/stryker-js/commit/1142f11209c481b602845d8068cde5bec57631ac))
- **deps:** update dependency file-url to v4 ([#3555](https://github.com/stryker-mutator/stryker-js/issues/3555)) ([658f00e](https://github.com/stryker-mutator/stryker-js/commit/658f00e6825c3229d18f9a45e79787d5e6c0fea1))
- **deps:** update dependency get-port to v6 ([#3556](https://github.com/stryker-mutator/stryker-js/issues/3556)) ([2cae23f](https://github.com/stryker-mutator/stryker-js/commit/2cae23f0bdb35143519134e0b0d21939b2b98a22))
- **deps:** update dependency glob to v8.0.3 ([#3531](https://github.com/stryker-mutator/stryker-js/issues/3531)) ([bb5611a](https://github.com/stryker-mutator/stryker-js/commit/bb5611abc762022de70098e9bd921ccc61427863))
- **deps:** update dependency inquirer to v9 ([#3592](https://github.com/stryker-mutator/stryker-js/issues/3592)) ([db0bd34](https://github.com/stryker-mutator/stryker-js/commit/db0bd34360de8b1d9f11b2226d2d7634cb4087d9))
- **deps:** update dependency log4js to ~6.5.0 ([#3547](https://github.com/stryker-mutator/stryker-js/issues/3547)) ([67df3f0](https://github.com/stryker-mutator/stryker-js/commit/67df3f0618e322e2e08eb937ff8a6cfe33c74b58))
- **deps:** update dependency minimatch to ~3.1.0 ([#3549](https://github.com/stryker-mutator/stryker-js/issues/3549)) ([a4e5c43](https://github.com/stryker-mutator/stryker-js/commit/a4e5c439e1082b714ab4c847c4c2e57dffa4971e))
- **deps:** update dependency minimatch to v5.1.0 ([#3548](https://github.com/stryker-mutator/stryker-js/issues/3548)) ([c27ec2f](https://github.com/stryker-mutator/stryker-js/commit/c27ec2f038c13ada285413ecc0a7a157afc9534c))
- **deps:** update dependency semver to v7.3.7 ([#3532](https://github.com/stryker-mutator/stryker-js/issues/3532)) ([2dce631](https://github.com/stryker-mutator/stryker-js/commit/2dce631e25c586ebf2344df815bc9a4a3dda6004))
- **jest:** allow mixin jest env for unit testing ([#3598](https://github.com/stryker-mutator/stryker-js/issues/3598)) ([da8a720](https://github.com/stryker-mutator/stryker-js/commit/da8a7206243f148030bf7421d236fd5b3be87b89))
- **logging:** log non-existing node_modules on debug ([#3521](https://github.com/stryker-mutator/stryker-js/issues/3521)) ([766072f](https://github.com/stryker-mutator/stryker-js/commit/766072f6a6b1f92ea5973948a1a6cfd5c55be1e9))

- feat(cucumber): support native esm (#3596) ([4eaf713](https://github.com/stryker-mutator/stryker-js/commit/4eaf7136db5d704fc70a646b53a3946eb42743d5)), closes [#3596](https://github.com/stryker-mutator/stryker-js/issues/3596)

### Features

- **mocha-runner:** report the test's file name ([#3504](https://github.com/stryker-mutator/stryker-js/issues/3504)) ([34d8e70](https://github.com/stryker-mutator/stryker-js/commit/34d8e70ff913303ea94080a5431d7c55bdf99987))
- **mutators:** Add method expression mutator ([#3508](https://github.com/stryker-mutator/stryker-js/issues/3508)) ([70a4e4f](https://github.com/stryker-mutator/stryker-js/commit/70a4e4f092b47c018ed1877d9011c7dbd7fdc5b2))
- **plugin:** allow fileDescriptions to be injected ([#3582](https://github.com/stryker-mutator/stryker-js/issues/3582)) ([fa2b77e](https://github.com/stryker-mutator/stryker-js/commit/fa2b77e3572884f44329e3f03b9201e9fd37082c))

### BREAKING CHANGES

- The `@stryker-mutator/cucumber-runner` now requires `@cucumber/cucumber` v8 or up.

## [6.0.2](https://github.com/stryker-mutator/stryker-js/compare/v6.0.1...v6.0.2) (2022-05-05)

### Bug Fixes

- **jest-runner:** support jest@28 ([#3501](https://github.com/stryker-mutator/stryker-js/issues/3501)) ([f312ad6](https://github.com/stryker-mutator/stryker-js/commit/f312ad6aee555f34f45b07de9d5ea8e7b253779c))

## [6.0.1](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0...v6.0.1) (2022-05-04)

### Bug Fixes

- **plugin loader:** no warn when not using plugins ([#3498](https://github.com/stryker-mutator/stryker-js/issues/3498)) ([54aa298](https://github.com/stryker-mutator/stryker-js/commit/54aa298fdb1fd9a959d0cae740793727cecb80ee))

# [6.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0-beta.0...v6.0.0) (2022-05-03)

### Bug Fixes

- **core:** allow parallel schedules ([#3485](https://github.com/stryker-mutator/stryker-js/issues/3485)) ([bbbd514](https://github.com/stryker-mutator/stryker-js/commit/bbbd51424ee03a0df08c915fbfdfbacd1d733f0e))
- **html-report:** set correct background color for html report ([#3456](https://github.com/stryker-mutator/stryker-js/issues/3456)) ([a72ecf1](https://github.com/stryker-mutator/stryker-js/commit/a72ecf180f133de09c5f53c5091c586c91a522df))
- **karma-runner:** allow dispose during init ([#3487](https://github.com/stryker-mutator/stryker-js/issues/3487)) ([4fcf148](https://github.com/stryker-mutator/stryker-js/commit/4fcf14837ae466e47653e5e88f1b5b79cd936746))
- **reporter:** report progress of failed check results only once ([#3472](https://github.com/stryker-mutator/stryker-js/issues/3472)) ([dce5882](https://github.com/stryker-mutator/stryker-js/commit/dce5882f103097fe7ec9aba56b5bd7cedfb22877))
- **stryker-cli:** allow stryker-cli integration ([330ef6c](https://github.com/stryker-mutator/stryker-js/commit/330ef6c9763db5bf47d23de64a6c72073bc44bc7))

### chore

- **node:** drop support for Node 12 ([10d874e](https://github.com/stryker-mutator/stryker-js/commit/10d874e4c46335d9ea457634d3061af35fa8f854))

### Code Refactoring

- **file:** move `File` from `api` to `util` ([#3489](https://github.com/stryker-mutator/stryker-js/issues/3489)) ([ac4bcca](https://github.com/stryker-mutator/stryker-js/commit/ac4bcca133930a046e0abf28abad24a5af1dbd22))

### Features

- **config file:** accept hidden config file by default. ([#3457](https://github.com/stryker-mutator/stryker-js/issues/3457)) ([701374f](https://github.com/stryker-mutator/stryker-js/commit/701374fe11936c83bfeab4f7b67846533ad6f026))
- **mocha-runner:** widen mocha peer dependency to include v10 ([#3492](https://github.com/stryker-mutator/stryker-js/issues/3492)) ([0dde30f](https://github.com/stryker-mutator/stryker-js/commit/0dde30f95c3cde3de7df6babfde71593534b8569))
- **mutation testing:** sort tests to improve performance ([#3467](https://github.com/stryker-mutator/stryker-js/issues/3467)) ([47344d3](https://github.com/stryker-mutator/stryker-js/commit/47344d37f26a694e95bc6745c1c66d5d7b9fe00c))
- **progress:** improve progressbar ETC estimate ([#3469](https://github.com/stryker-mutator/stryker-js/issues/3469)) ([ec63d93](https://github.com/stryker-mutator/stryker-js/commit/ec63d9397a0cf23e5fb91b9f6e3ae68ab2d3b2e0))
- **react:** support react 18 projects by default ([#3491](https://github.com/stryker-mutator/stryker-js/issues/3491)) ([82d9bce](https://github.com/stryker-mutator/stryker-js/commit/82d9bce0f351ce8b0c852684665bcec129846ee3))
- **warn slow:** warn users for slow runs ([#3490](https://github.com/stryker-mutator/stryker-js/issues/3490)) ([1103958](https://github.com/stryker-mutator/stryker-js/commit/1103958c02fc32a1131c2ad6504bee892c250261))

### BREAKING CHANGES

- **file:** The `File` class is no longer part of the public api and is thus no longer exported from `@stryker-mutator/api`. Plugin creators shouldn't rely on it anymore.
- **progress:** Reporter API method `onAllMutantsMatchedWithTests` has been replaced by `onMutationTestingPlanReady`. Please use that for your reporter plugin instead.
- **progress:** Reporter API method `onAllSourceFilesRead` has been removed, please use `onMutationTestReportReady` to retrieve the source files.
- **progress:** Reporter API method `onSourceFileRead` has been removed, please use `onMutationTestReportReady` to retrieve the source files.
- **node:** Drop support for Node 12. Minimal version is now Node 14.18.0.

# [6.0.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v5.6.1...v6.0.0-beta.0) (2022-03-02)

### Bug Fixes

- **jest:** hit limit spread over multiple files ([#3446](https://github.com/stryker-mutator/stryker-js/issues/3446)) ([51308f4](https://github.com/stryker-mutator/stryker-js/commit/51308f4f071693b19dd0f335a107c6ffa87ce309))

### Features

- **checker-api:** support checking on groups of mutants ([#3450](https://github.com/stryker-mutator/stryker-js/issues/3450)) ([e9bbd39](https://github.com/stryker-mutator/stryker-js/commit/e9bbd394092aa86f2eabc857ec7feabc6d7a0b4f))
- **esm config:** support config file as pure esm ([#3432](https://github.com/stryker-mutator/stryker-js/issues/3432)) ([309a7e2](https://github.com/stryker-mutator/stryker-js/commit/309a7e2807e454a82f177de781bc4908f87c739b))
- **esm:** migrate StrykerJS to pure ESM ([#3409](https://github.com/stryker-mutator/stryker-js/issues/3409)) ([78c305e](https://github.com/stryker-mutator/stryker-js/commit/78c305e2c2271fedb54bfff3d34aa6b70b421b3a))
- **esm:** support esm in the mocha runner ([#3393](https://github.com/stryker-mutator/stryker-js/issues/3393)) ([2eb3504](https://github.com/stryker-mutator/stryker-js/commit/2eb35042da4e78021dcf54ac71c22f97eb91ff70)), closes [#2413](https://github.com/stryker-mutator/stryker-js/issues/2413) [#2413](https://github.com/stryker-mutator/stryker-js/issues/2413)
- **esm:** support native es modules in the jasmine runner. ([#3396](https://github.com/stryker-mutator/stryker-js/issues/3396)) ([94708d0](https://github.com/stryker-mutator/stryker-js/commit/94708d00b43e3f84accd42ccb40d95ff30718efa)), closes [#3340](https://github.com/stryker-mutator/stryker-js/issues/3340)
- **hit limit:** infinite loop prevention in jest-runner ([#3439](https://github.com/stryker-mutator/stryker-js/issues/3439)) ([5fecd52](https://github.com/stryker-mutator/stryker-js/commit/5fecd520abd1826ee4c8296d7f1bbee197a300dc))
- **html reporter:** allow choice of `fileName`. ([#3438](https://github.com/stryker-mutator/stryker-js/issues/3438)) ([d197319](https://github.com/stryker-mutator/stryker-js/commit/d197319a21872a77b28cfef16c1087bf1bb4b9dc))
- **ignore static:** allow to ignore static mutants ([#3284](https://github.com/stryker-mutator/stryker-js/issues/3284)) ([75d9b79](https://github.com/stryker-mutator/stryker-js/commit/75d9b792e04dbafaaaff88c3994cf1a1e456610b))
- **ignore static:** prevent leak of hybrid mutants ([#3443](https://github.com/stryker-mutator/stryker-js/issues/3443)) ([231049a](https://github.com/stryker-mutator/stryker-js/commit/231049a32f73083c7579b1bf8b4424ad309f655d))
- **karma-runner:** support async karma configuration ([#3433](https://github.com/stryker-mutator/stryker-js/issues/3433)) ([7204a43](https://github.com/stryker-mutator/stryker-js/commit/7204a431fb526785029d9d87eadbdadfc0e3ddcd)), closes [/github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23](https://github.com//github.com/karma-runner/karma/blob/master/CHANGELOG.md/issues/630-2021-03-23)
- **reload test environment:** implement test environment reload ([#3369](https://github.com/stryker-mutator/stryker-js/issues/3369)) ([b95b907](https://github.com/stryker-mutator/stryker-js/commit/b95b907e54d3a114731a8bcf659a1910df4e4f0b))
- **test runner api:** `killedBy` is always an array ([#3187](https://github.com/stryker-mutator/stryker-js/issues/3187)) ([c257966](https://github.com/stryker-mutator/stryker-js/commit/c257966e6c7726e180e072c8ae7f3fd011485c05))

### Performance Improvements

- **esm:** migrate perf tests tasks to esm ([#3441](https://github.com/stryker-mutator/stryker-js/issues/3441)) ([e31d625](https://github.com/stryker-mutator/stryker-js/commit/e31d6250bea30971aaaba894c4043e2359b4fb89))

### BREAKING CHANGES

- **checker-api:** The `check` method of checker plugins now receives a _group of mutants_ and should provide a `CheckResult` per mutant id.
- **html reporter:** Configuration option `htmlReporter.baseDir` is deprecated and will be removed in a later version. Please use `htmlReporter.fileName` instead.
- **esm config:** Exporting a function (using `module.exports = function(config) {}`) from your `stryker.conf.js` file is no longer supported. This was already deprecated but now will give an error.
- **esm:** StrykerJS is now a pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **esm:** Node 12.20 is now the min version.
- **esm:** Karma v6.3 is now the min supported karma version for `@stryker-mutator/karma-runner`, since [that version added support for async config loading](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23)
- **esm:** The `@stryker-mutator/jamsine-runner` now requires jasmine@3.10 or higher.
- **esm:** The `@stryker-mutator/mocha-runner` now requires `mocha@7.2` or higher.
- **reload test environment:** Test runner plugins must provide `TestRunnerCapabilities` by implementing the `capabilities` method.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

### Bug Fixes

- **deps:** remove vulnerability by updating log4js ([#3372](https://github.com/stryker-mutator/stryker-js/issues/3372)) ([69290f2](https://github.com/stryker-mutator/stryker-js/commit/69290f287f30eee9fac96dc32bd1df2f24180b07)), closes [/github.com/log4js-node/log4js-node/blob/master/CHANGELOG.md#640](https://github.com//github.com/log4js-node/log4js-node/blob/master/CHANGELOG.md/issues/640)
- **mutators:** avoid creating some unnecessary mutations ([#3346](https://github.com/stryker-mutator/stryker-js/issues/3346)) ([0f60ecf](https://github.com/stryker-mutator/stryker-js/commit/0f60ecf2159490d6fa411ea3fa0c3a091fcdd8fa))
- **typescript cheker:** prevent unintentional declarationDir error ([#3358](https://github.com/stryker-mutator/stryker-js/issues/3358)) ([3b510e2](https://github.com/stryker-mutator/stryker-js/commit/3b510e2b28515d325d3583d500743064f5b156a7))

# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

### Bug Fixes

- **jasmine:** correct peer dependency for jasmine ([#3341](https://github.com/stryker-mutator/stryker-js/issues/3341)) ([07b50a9](https://github.com/stryker-mutator/stryker-js/commit/07b50a922b50fea64c978ab7023f8ea0486d9392))
- **report:** dramatically improve rendering performance of HTML report ([ad38c82](https://github.com/stryker-mutator/stryker-js/commit/ad38c8219ab5cd6dc477b67bf3416c9afdfba972))
- **tsconfig:** force declarationDir false for non-build projects ([#3313](https://github.com/stryker-mutator/stryker-js/issues/3313)) ([461f39c](https://github.com/stryker-mutator/stryker-js/commit/461f39cc0808dbab2ad405a96193aa4586f7f699))

### Features

- **clear-text reporter:** show n/a instead of NaN ([68c5c51](https://github.com/stryker-mutator/stryker-js/commit/68c5c5183c04ea2cf6b5943996972f4e411e32a9))

## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

### Bug Fixes

- **ts checker:** always disable `declarationMap` ([#3294](https://github.com/stryker-mutator/stryker-js/issues/3294)) ([990ecdc](https://github.com/stryker-mutator/stryker-js/commit/990ecdcf75ace7ad4553fd7c362d29d9bfa423ce))
- **tsconfig:** rewrite "include" patterns ([#3293](https://github.com/stryker-mutator/stryker-js/issues/3293)) ([37ead22](https://github.com/stryker-mutator/stryker-js/commit/37ead22ff84925418ca7682b3e3a5d2271e7e97f)), closes [#3281](https://github.com/stryker-mutator/stryker-js/issues/3281)

# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

### Bug Fixes

- **instrumenter:** don't mutate TS generics ([#3268](https://github.com/stryker-mutator/stryker-js/issues/3268)) ([88d6eaf](https://github.com/stryker-mutator/stryker-js/commit/88d6eaff7b9ffab7f45c76e8f348a131798f7671))
- **logging:** don't log log4js category to file as well ([31609a5](https://github.com/stryker-mutator/stryker-js/commit/31609a52d255eb3f174f196f31c13f159c10f774))
- **util:** clear require.cache behavior on case-insensitive file systems ([#3194](https://github.com/stryker-mutator/stryker-js/issues/3194)) ([39e3d86](https://github.com/stryker-mutator/stryker-js/commit/39e3d86238b29e5326b4f741f882cf3665200d1a))

### Features

- **checkers:** allow custom checker node args ([#3179](https://github.com/stryker-mutator/stryker-js/issues/3179)) ([82c4435](https://github.com/stryker-mutator/stryker-js/commit/82c4435e77b5b13aee5a4117a119b4f5dde68c2b))
- **cli:** display suggestions on error ([#3216](https://github.com/stryker-mutator/stryker-js/issues/3216)) ([9ed98e8](https://github.com/stryker-mutator/stryker-js/commit/9ed98e82e5e895ed34afb3f0247cfa29940247a0))
- **config:** Add link to docs when generating a custom config ([#3235](https://github.com/stryker-mutator/stryker-js/issues/3235)) ([7c999b8](https://github.com/stryker-mutator/stryker-js/commit/7c999b8fa5689bb7ed0e299b531add67ee101dc6))
- **hit limit:** infinite loop prevention in jasmine-runner ([#3199](https://github.com/stryker-mutator/stryker-js/issues/3199)) ([bc792e0](https://github.com/stryker-mutator/stryker-js/commit/bc792e087225641256c95f18a6d70fefdca507b5))
- **hit limit:** infinite loop prevention in mocha-runner ([f5a7d1d](https://github.com/stryker-mutator/stryker-js/commit/f5a7d1d18ec45364743e5aceb71f0f1bbbf3bafa))
- **html:** new diff-view when selecting mutants ([#3263](https://github.com/stryker-mutator/stryker-js/issues/3263)) ([8b253ee](https://github.com/stryker-mutator/stryker-js/commit/8b253ee8ed92d447b5f854e4250f8e1fd064cd13))
- **init:** add buildCommand question when running ([#3213](https://github.com/stryker-mutator/stryker-js/issues/3213)) ([b9d5980](https://github.com/stryker-mutator/stryker-js/commit/b9d5980fbbc69ace8acab404793418a134b2f62f))
- **jest-runner:** support `--findRelatedTests` in dry run ([#3234](https://github.com/stryker-mutator/stryker-js/issues/3234)) ([b2e4584](https://github.com/stryker-mutator/stryker-js/commit/b2e458432483353dd0ea0471b623326ff58c92bc))
- **mutators:** Implement missing AssignmentOperatorMutator ([#3203](https://github.com/stryker-mutator/stryker-js/issues/3203)) ([95b694b](https://github.com/stryker-mutator/stryker-js/commit/95b694b89430af58ec085bea07883372976fbb02))

## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

### Bug Fixes

- **instrumenter:** don't break optional chains([#3156](https://github.com/stryker-mutator/stryker-js/issues/3156)) ([95e6b69](https://github.com/stryker-mutator/stryker-js/commit/95e6b69d3267bbda9fdd1ef60350993e05a7dbe7))
- **ProgressReporter:** don't render when there are no valid mutants to render ([#3155](https://github.com/stryker-mutator/stryker-js/issues/3155)) ([41c4177](https://github.com/stryker-mutator/stryker-js/commit/41c4177cdec23a8d054e9b287618889eed3db15e))
- **typescript-checker:** support TS 4.4 ([#3178](https://github.com/stryker-mutator/stryker-js/issues/3178)) ([772e5bc](https://github.com/stryker-mutator/stryker-js/commit/772e5bcb126b4a44024921c31b760d57d92afd94))

# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

### Features

- **ignore:** support disable directives in source code ([#3072](https://github.com/stryker-mutator/stryker-js/issues/3072)) ([701d8b3](https://github.com/stryker-mutator/stryker-js/commit/701d8b348e2e529e9352d546fab246815e1d7a9a))
- **test runner:** Support for disable bail ([#3074](https://github.com/stryker-mutator/stryker-js/issues/3074)) ([0962232](https://github.com/stryker-mutator/stryker-js/commit/0962232fe2a181a2fde0067ed95f99885b8cee28))

# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

### Bug Fixes

- **checker:** retry on process crash ([#3059](https://github.com/stryker-mutator/stryker-js/issues/3059)) ([8880643](https://github.com/stryker-mutator/stryker-js/commit/888064313763d907d5f621103955bbc1a788afaf))
- **jest-runner:** load .env for create-react-app ([#3055](https://github.com/stryker-mutator/stryker-js/issues/3055)) ([12e1324](https://github.com/stryker-mutator/stryker-js/commit/12e132410637a9bc4724c4b1fd43acd70f841ce3))
- **node 12:** clear error message for node <12.17 ([#3056](https://github.com/stryker-mutator/stryker-js/issues/3056)) ([9630fc3](https://github.com/stryker-mutator/stryker-js/commit/9630fc3d838adb2c3f47e312239b4ab37cc7b87a))

### Features

- **hit limit:** infinite loop prevention in karma-runner ([#3031](https://github.com/stryker-mutator/stryker-js/issues/3031)) ([fc732fc](https://github.com/stryker-mutator/stryker-js/commit/fc732fce8838c96be2fdf37aff69b12c996d7cb0))
- **report:** show status reason in the html report. ([d777e49](https://github.com/stryker-mutator/stryker-js/commit/d777e49639a2161abc9f9708157409163603874a))

## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

### Bug Fixes

- **karma runner:** restart a browser on disconnect error ([#3020](https://github.com/stryker-mutator/stryker-js/issues/3020)) ([fc5c449](https://github.com/stryker-mutator/stryker-js/commit/fc5c449ba329d7a8b07d47193d4916cb28d47bb1))
- **mocha-runner:** clear error when require esm ([#3015](https://github.com/stryker-mutator/stryker-js/issues/3015)) ([a835f0b](https://github.com/stryker-mutator/stryker-js/commit/a835f0b57a9084b77a175b5eb14f409651c20c69)), closes [#3014](https://github.com/stryker-mutator/stryker-js/issues/3014)

## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

### Bug Fixes

- **schema:** Resolve "No 'exports' main" error ([#3004](https://github.com/stryker-mutator/stryker-js/issues/3004)) ([9034806](https://github.com/stryker-mutator/stryker-js/commit/90348066bf3341a669cad67070a61f9dfd58f522))

## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

### Bug Fixes

- **cucumber:** off-by-one error in report ([#2987](https://github.com/stryker-mutator/stryker-js/issues/2987)) ([5e184c1](https://github.com/stryker-mutator/stryker-js/commit/5e184c1c6d2d4a998ce5f4c2bef48a772e11cebb))

### Features

- **html:** highlight files in html report ([b7876a4](https://github.com/stryker-mutator/stryker-js/commit/b7876a4c6289e854167d2ed5b2915e16499e0651))
- **mutator:** add the optional chaining mutator ([#2988](https://github.com/stryker-mutator/stryker-js/issues/2988)) ([43ac767](https://github.com/stryker-mutator/stryker-js/commit/43ac76774d9f5b2bca3f56f99a88f341d6027027))

# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

### Bug Fixes

- **ignore patterns:** always ignore \*.tsbuildinfo files ([#2985](https://github.com/stryker-mutator/stryker-js/issues/2985)) ([794f103](https://github.com/stryker-mutator/stryker-js/commit/794f10390787d1bfa6e4a261315e4bc791790787))

### Features

- **🥒:** add support for cucumber-js test runner ([#2970](https://github.com/stryker-mutator/stryker-js/issues/2970)) ([86d6f79](https://github.com/stryker-mutator/stryker-js/commit/86d6f7998aeb2e0e2265480fd3f75d703e39b3dc))
- **instrumenter:** Implement new mutant placing algorithm ([#2964](https://github.com/stryker-mutator/stryker-js/issues/2964)) ([24b8bc9](https://github.com/stryker-mutator/stryker-js/commit/24b8bc9a15f597d3c5b626dd282d9ecda57f9b32))

## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

### Bug Fixes

- **peerDeps:** update peer dependencies ([05733d2](https://github.com/stryker-mutator/stryker-js/commit/05733d260d5ffc9eb1b3e284bdc4bc8adafc4d38))

# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

### Bug Fixes

- **jest-runner:** allow a different rootDir ([b66a617](https://github.com/stryker-mutator/stryker-js/commit/b66a61711a8bea554e29efb8848fa4c9d0afb34c))
- **jest-runner:** use local jest version when jest@<25 ([#2950](https://github.com/stryker-mutator/stryker-js/issues/2950)) ([3218c9e](https://github.com/stryker-mutator/stryker-js/commit/3218c9e57a641866f9b13028c9239af39e7c60a7))

### Features

- **jest-runner:** allow configuration in a custom package.json ([825548c](https://github.com/stryker-mutator/stryker-js/commit/825548c66956ff34c500caadb1ebc2030ef59df3))
- **jest-runner:** dynamically override "testEnvironment" ([#2934](https://github.com/stryker-mutator/stryker-js/issues/2934)) ([0590869](https://github.com/stryker-mutator/stryker-js/commit/05908690cd5fb5c70ff032c6a985bb57bcebb301))
- **jest-runner:** support findRelatedTests for mutated files outside of roots ([#2951](https://github.com/stryker-mutator/stryker-js/issues/2951)) ([19dccec](https://github.com/stryker-mutator/stryker-js/commit/19dcceca950c7c92d08826a4958db73eca7e71dd))
- **mocha-runner:** officially support mocha 9 ([42848bb](https://github.com/stryker-mutator/stryker-js/commit/42848bba288adcefb8d8f8fac1cd34b17bd1d49f))

## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

### Bug Fixes

- **jest-runner:** Support Jest v27 ([#2861](https://github.com/stryker-mutator/stryker-js/issues/2861)) ([8d3560b](https://github.com/stryker-mutator/stryker-js/commit/8d3560bd2f1b8cbb4235b13dbef9afa84708ac73))
- **mocha-runner:** improve debug logging ([#2925](https://github.com/stryker-mutator/stryker-js/issues/2925)) ([ecc53ee](https://github.com/stryker-mutator/stryker-js/commit/ecc53ee3314f9e4b71aa370f35d87d699471fc55))

# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)

### Bug Fixes

- **sandbox:** make directory if not exists before symlinking node_modules ([#2856](https://github.com/stryker-mutator/stryker-js/issues/2856)) ([40f9a1d](https://github.com/stryker-mutator/stryker-js/commit/40f9a1dfcc49507f28193d6049b08a246baa0ad7))
- **vue-tsx:** support parsing tsx script in .vue file ([#2850](https://github.com/stryker-mutator/stryker-js/issues/2850)) ([dc66c28](https://github.com/stryker-mutator/stryker-js/commit/dc66c28999a548c3c1837dc10d4d38033ae36b1b))

### Features

- **es:** convert to es2019 ([#2846](https://github.com/stryker-mutator/stryker-js/issues/2846)) ([36c687f](https://github.com/stryker-mutator/stryker-js/commit/36c687fd5735e63502db0ad8b8a302f978cd8027))
- **ignore patterns:** add "ignorePatterns" config option ([#2848](https://github.com/stryker-mutator/stryker-js/issues/2848)) ([a69992c](https://github.com/stryker-mutator/stryker-js/commit/a69992cfe5983d94e1dce0dfb367302a42001fe2)), closes [#1593](https://github.com/stryker-mutator/stryker-js/issues/1593) [#2739](https://github.com/stryker-mutator/stryker-js/issues/2739)
- **jest:** report test files and test positions ([#2808](https://github.com/stryker-mutator/stryker-js/issues/2808)) ([c19095e](https://github.com/stryker-mutator/stryker-js/commit/c19095e57f6a46d7d9c9b97f852747d4167ab256))
- **jest-runner:** drop projectType "create-react-app-ts" ([#2788](https://github.com/stryker-mutator/stryker-js/issues/2788)) ([2581e32](https://github.com/stryker-mutator/stryker-js/commit/2581e32435894f47f47ad79f50ca12c3368c6c13)), closes [#2787](https://github.com/stryker-mutator/stryker-js/issues/2787) [#2787](https://github.com/stryker-mutator/stryker-js/issues/2787)
- **mutators:** mutate nullish coalescing operator ([#2884](https://github.com/stryker-mutator/stryker-js/issues/2884)) ([021a419](https://github.com/stryker-mutator/stryker-js/commit/021a4193232318155139ad5df68bf74748fc112c))
- **node:** Drop support for node 10 ([#2879](https://github.com/stryker-mutator/stryker-js/issues/2879)) ([dd29f88](https://github.com/stryker-mutator/stryker-js/commit/dd29f883d384fd29b86a0ef9f78808975657a001))
- **options:** make "perTest" the default for "coverageAnalysis" ([#2881](https://github.com/stryker-mutator/stryker-js/issues/2881)) ([518ebe6](https://github.com/stryker-mutator/stryker-js/commit/518ebe6b946fc35138b636a015b569fe9a272ed0))
- **range:** remove Range from the API ([#2882](https://github.com/stryker-mutator/stryker-js/issues/2882)) ([b578b22](https://github.com/stryker-mutator/stryker-js/commit/b578b22eb9ccdd023602573d5d6e52c49bf99e0f)), closes [#322](https://github.com/stryker-mutator/stryker-js/issues/322)
- **report:** add test details and metadata to JSON report ([#2755](https://github.com/stryker-mutator/stryker-js/issues/2755)) ([acb0a3a](https://github.com/stryker-mutator/stryker-js/commit/acb0a3a3ddf8e82ffbae7212538fd0bba4802944))
- **report:** report test states ([#2868](https://github.com/stryker-mutator/stryker-js/issues/2868)) ([e84aa88](https://github.com/stryker-mutator/stryker-js/commit/e84aa8849d6746ebaa22005423f6f461a67df0a9))
- **reporter api:** unify reporter api with mutation-testing-elements ([#2798](https://github.com/stryker-mutator/stryker-js/issues/2798)) ([d173b27](https://github.com/stryker-mutator/stryker-js/commit/d173b27117ade43e86a991643207532e338e7907)), closes [#2766](https://github.com/stryker-mutator/stryker-js/issues/2766)
- **serialize:** remove surrial ([#2877](https://github.com/stryker-mutator/stryker-js/issues/2877)) ([5114835](https://github.com/stryker-mutator/stryker-js/commit/51148357ed0103ebd6f60259d468bd34e535a4b3))

### BREAKING CHANGES

- **range:** The `range` property is no longer present on a `mutant`. Note, this is a breaking change for plugin creators only.
- **options:** `"perTest"` is now the default value for "coverageAnalysis" when the configured test runner is not "command". Explicitly set `"coverageAnalysis": "off"` manually to opt-out of this behavior.
- **node:** Node 10 is no longer supported. Please use Node 12 or higher.
- **serialize:** Having a non-JSON-serializable value in your configuration won't be sent to the child process anymore. If you really need them in your test runner configuration, you should isolate those values and put them in test runner-specific config files, loaded by the test runner plugin itself, for example, jest.config.js, karma.conf.js, webpack.config.js.
- **ignore patterns:** Stryker will no longer use a git command to determine which files belong to your project. Instead, it will rely on sane defaults. You can change this behavior by defining [`ignorePatterns`](https://stryker-mutator.io/docs/stryker-js/configuration/#ignorepatterns-string).
- **ignore patterns:** The `files` configuration option is deprecated and will be removed in a future release. Please use [`ignorePatterns`](https://stryker-mutator.io/docs/stryker-js/configuration/#ignorepatterns-string) instead.

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

- **reporter api:** Changes to `Reporter` and `TestRunner` plugin API of Stryker
- **jest-runner:** Support for project type `create-react-app-ts` is dropped from the jest-runner.

# [4.6.0](https://github.com/stryker-mutator/stryker-js/compare/v4.5.1...v4.6.0) (2021-04-16)

### Features

- **mutation range:** allow specifying a mutation range ([#2751](https://github.com/stryker-mutator/stryker-js/issues/2751)) ([84647cf](https://github.com/stryker-mutator/stryker-js/commit/84647cf8c4052dead95d4d23a0e9c0c66e54292c))
- **rename:** rename to StrykerJS ([#2813](https://github.com/stryker-mutator/stryker-js/issues/2813)) ([dc08592](https://github.com/stryker-mutator/stryker-js/commit/dc08592c09c0fe5fcc21db03dc2da4e03713f46b)), closes [#2754](https://github.com/stryker-mutator/stryker-js/issues/2754)

## [4.5.1](https://github.com/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)

### Bug Fixes

- **babel-transformer:** respect top of the file comments/pragma ([#2783](https://github.com/stryker-mutator/stryker/issues/2783)) ([ca42276](https://github.com/stryker-mutator/stryker/commit/ca422764a2ba5552ef34965532e0b9030f110669))
- **instrumenter:** corect mutant location in .vue and .html files ([547a25c](https://github.com/stryker-mutator/stryker/commit/547a25cfa13e89a597c433bb329ee011abe84420)), closes [#2790](https://github.com/stryker-mutator/stryker/issues/2790)
- **peer-deps:** use correct peer dep version ([a6ca0f2](https://github.com/stryker-mutator/stryker/commit/a6ca0f25b29cb84a2cb4b8c05a42e7305d5dde16))

# [4.5.0](https://github.com/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)

### Bug Fixes

- **logging:** log info about symlinking on debug ([#2756](https://github.com/stryker-mutator/stryker/issues/2756)) ([c672e2e](https://github.com/stryker-mutator/stryker/commit/c672e2e0fc27817aae43839f39a166b5b1b9ba07))
- **mutator:** don't mutate string literal object methods ([#2718](https://github.com/stryker-mutator/stryker/issues/2718)) ([964537a](https://github.com/stryker-mutator/stryker/commit/964537a37dece036573f88bace6c714a0413a2e7))
- **reporting:** report test name when a hook fails ([#2757](https://github.com/stryker-mutator/stryker/issues/2757)) ([5e062b2](https://github.com/stryker-mutator/stryker/commit/5e062b2b65a1269b45a66ecc536108aab529abae))
- **typescript-checker:** improve error reporting ([2502eba](https://github.com/stryker-mutator/stryker/commit/2502eba08b0c26c1b91cbd5917092ccd7a89aa7c))
- **typescript-checker:** resolve tsconfig files correctly ([8cf9e8c](https://github.com/stryker-mutator/stryker/commit/8cf9e8c43b7e3817452b32de9461829ed9ad6490))

### Features

- **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))
- **sandbox:** support symlinking of node_modules anywhere ([ee66623](https://github.com/stryker-mutator/stryker/commit/ee666238b29facf512126d6e056037e8ac011260))

## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

### Bug Fixes

- **jest-runner:** support custom rootDir ([312f6fe](https://github.com/stryker-mutator/stryker/commit/312f6feb6350c6f4027854ab9847006f527fafd2))

# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

### Bug Fixes

- **child-process:** improve out-of-memory recognition ([#2697](https://github.com/stryker-mutator/stryker/issues/2697)) ([b97220a](https://github.com/stryker-mutator/stryker/commit/b97220a6c810b7ccc1f5fdb6e84be828a58ba1b0))
- **jasmine:** support jasmine >3.6.2 ([#2594](https://github.com/stryker-mutator/stryker/issues/2594)) ([582079b](https://github.com/stryker-mutator/stryker/commit/582079b97dbe7ad2526a6815740d452da66a8617))

### Features

- **in place:** support in place mutation ([#2706](https://github.com/stryker-mutator/stryker/issues/2706)) ([2685a7e](https://github.com/stryker-mutator/stryker/commit/2685a7eb86c808c363aad3151f2c67f273bdf314))
- **regex-mutator:** smart regex mutations ([#2709](https://github.com/stryker-mutator/stryker/issues/2709)) ([0877f44](https://github.com/stryker-mutator/stryker/commit/0877f443219a29c34ac13ca27f33cbf884b5bb4b))

## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package stryker-parent

# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

### Features

- single file HTML report ([#2540](https://github.com/stryker-mutator/stryker/issues/2540)) ([057f9fd](https://github.com/stryker-mutator/stryker/commit/057f9fdf2b5468e8ea76e8be57475fd58a28b7c4))
- **jest-runner:** support coverage analysis ([#2634](https://github.com/stryker-mutator/stryker/issues/2634)) ([5662e58](https://github.com/stryker-mutator/stryker/commit/5662e581e03ed955d1c851c9d818f0ad4e0d18a8))

# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

### Bug Fixes

- **arithmatic-mutator:** Don't mutate obvious string concat ([#2648](https://github.com/stryker-mutator/stryker/issues/2648)) ([71f8f9a](https://github.com/stryker-mutator/stryker/commit/71f8f9a6f4f663942c83d64667058d1de3d958a6))
- **CLI help:** remove non-existant logLevel 'all' ([#2626](https://github.com/stryker-mutator/stryker/issues/2626)) ([718a7f2](https://github.com/stryker-mutator/stryker/commit/718a7f2a6947f24f85dd0611e85d27a282ef3eb5))

### Features

- **debugging:** allow passing node args to the test runner ([#2609](https://github.com/stryker-mutator/stryker/issues/2609)) ([fdd95c0](https://github.com/stryker-mutator/stryker/commit/fdd95c0c6abe02201fd4ec914fc97d2cf0adf7d1))
- **jest-runner:** resolve local jest version ([#2623](https://github.com/stryker-mutator/stryker/issues/2623)) ([1466f9a](https://github.com/stryker-mutator/stryker/commit/1466f9a988d11a4c43cd7c97f195b0eacb75c96f))
- **karma-runner:** resolve local karma and ng version ([#2622](https://github.com/stryker-mutator/stryker/issues/2622)) ([5b92130](https://github.com/stryker-mutator/stryker/commit/5b921302787a526377be02a37eb43a487c8f283d))
- **resporter:** add json reporter ([#2582](https://github.com/stryker-mutator/stryker/issues/2582)) ([d18c4aa](https://github.com/stryker-mutator/stryker/commit/d18c4aaa3494931aa4b92eb277254e796d865e51))
- **timeout:** add `--dryRunTimeoutMinutes` option ([494e821](https://github.com/stryker-mutator/stryker/commit/494e8212bdc9bdebde262cf24f4cc5ca53f0fc79))

## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

### Bug Fixes

- **peerDeps:** update core in peerDependencies ([045dbc3](https://github.com/stryker-mutator/stryker/commit/045dbc3742c123658f4cf9ab2786b20ffd89a8cf))

## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

### Bug Fixes

- **disable-checking:** allow jest environment ([#2607](https://github.com/stryker-mutator/stryker/issues/2607)) ([26aca66](https://github.com/stryker-mutator/stryker/commit/26aca661dcf02efc7d0d57408d45a02d2a5a4b82))
- **ts:** support es private fields ([#2605](https://github.com/stryker-mutator/stryker/issues/2605)) ([6bd2fbb](https://github.com/stryker-mutator/stryker/commit/6bd2fbbf0aaa5154930ce36f4d153ee91a3c5f1f))

# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

### Bug Fixes

- **concurrency:** better default for low CPU count ([#2546](https://github.com/stryker-mutator/stryker/issues/2546)) ([eac9199](https://github.com/stryker-mutator/stryker/commit/eac9199428dd1b34df756f55b9a457046b536adf))
- **instrumenter:** add missing case for .jsx files in parser ([#2577](https://github.com/stryker-mutator/stryker/issues/2577)) ([cea94aa](https://github.com/stryker-mutator/stryker/commit/cea94aa90347ab1ff601205014116d41a6bef3f9))
- **string-literal-mutator:** don't mutate class property keys ([#2544](https://github.com/stryker-mutator/stryker/issues/2544)) ([8c8b478](https://github.com/stryker-mutator/stryker/commit/8c8b47819a6f415c0da773888ed7692cf5d76776))

### Features

- **angular:** update Karma config path in Angular preset ([#2548](https://github.com/stryker-mutator/stryker/issues/2548)) ([986acba](https://github.com/stryker-mutator/stryker/commit/986acba1c3aa59130b876f90e29e4925898e70a6))
- **html:** reposition stryker image ([#2593](https://github.com/stryker-mutator/stryker/issues/2593)) ([21d635a](https://github.com/stryker-mutator/stryker/commit/21d635aae0e6392cb7facd9a0974e7fc525f2fb7))
- **HTML reporter:** Dark mode support 🌑 ([#2590](https://github.com/stryker-mutator/stryker/issues/2590)) ([ca9a513](https://github.com/stryker-mutator/stryker/commit/ca9a513c3e2a95337fbca74752408c8372fe5c5d))
- **instrumenter:** update to babel 7.12 ([#2592](https://github.com/stryker-mutator/stryker/issues/2592)) ([300b73f](https://github.com/stryker-mutator/stryker/commit/300b73f60dde87b8780341d1ac6d2d6ab5aeb69e))
- **mocha:** support mocha 8.2 ([#2591](https://github.com/stryker-mutator/stryker/issues/2591)) ([b633629](https://github.com/stryker-mutator/stryker/commit/b63362983477815cde15e20e8453079128b9e609))

# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

### Bug Fixes

- **instrumenter:** don't mutate generics ([#2530](https://github.com/stryker-mutator/stryker/issues/2530)) ([ed42e3c](https://github.com/stryker-mutator/stryker/commit/ed42e3c222a7bd0f98090a77cfee08db366679a1))
- **presets:** update `init` templates for 4.0 release ([#2526](https://github.com/stryker-mutator/stryker/issues/2526)) ([ec0d75e](https://github.com/stryker-mutator/stryker/commit/ec0d75e968cd2cffc662dd91ea0eee07042f0b3c))

# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

### Bug Fixes

- **instrumenter:** switch case mutant placer ([#2518](https://github.com/stryker-mutator/stryker/issues/2518)) ([a560711](https://github.com/stryker-mutator/stryker/commit/a560711023990dca950700da18269e78249b5c49))

### Features

- **instrumenter:** add excludedMutations support ([#2513](https://github.com/stryker-mutator/stryker/issues/2513)) ([bfd714f](https://github.com/stryker-mutator/stryker/commit/bfd714fe1b4f9c3b2468164a95d0c5bd0cbc8fcf))

# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)

### Bug Fixes

- **config:** deprecate function based config ([#2499](https://github.com/stryker-mutator/stryker/issues/2499)) ([8ea3c18](https://github.com/stryker-mutator/stryker/commit/8ea3c18421929a0724ff99e5bf02ce0f174266cd))
- **core:** fix "too many open files" ([#2498](https://github.com/stryker-mutator/stryker/issues/2498)) ([5b7c242](https://github.com/stryker-mutator/stryker/commit/5b7c2424dc57b32d390112bcbf8b79bf41c05a11))
- **instrumenter:** only add header when there are mutats ([#2503](https://github.com/stryker-mutator/stryker/issues/2503)) ([8f989cc](https://github.com/stryker-mutator/stryker/commit/8f989cceb8fea5e66e3055a623f238ce85ef1025))
- **mutate config:** don't warn about files not existing at the default mutate location ([#2509](https://github.com/stryker-mutator/stryker/issues/2509)) ([66c2444](https://github.com/stryker-mutator/stryker/commit/66c24447e28c4218d3e58b945b1bcc5891855097)), closes [#2455](https://github.com/stryker-mutator/stryker/issues/2455)
- **shebang:** support shebang in in files ([#2510](https://github.com/stryker-mutator/stryker/issues/2510)) ([7d2dd80](https://github.com/stryker-mutator/stryker/commit/7d2dd80f2c7a89f31c8f96c2e911a6f9beaf7cbc))

### Features

- **core:** add `appendPlugins` command-line option ([#2385](https://github.com/stryker-mutator/stryker/issues/2385)) ([0dec9b8](https://github.com/stryker-mutator/stryker/commit/0dec9b84b07391752af5514f90a2120c4f01d260))
- **core:** correct initial test run timing ([#2496](https://github.com/stryker-mutator/stryker/issues/2496)) ([4f5a37e](https://github.com/stryker-mutator/stryker/commit/4f5a37eb63a4e9532022821dac85d68f8939ceab))
- **jest-runner:** deprecate "create-react-app-ts" ([#2497](https://github.com/stryker-mutator/stryker/issues/2497)) ([0aacc7b](https://github.com/stryker-mutator/stryker/commit/0aacc7be5bb045887e96f0a8115b7e3e46e1a1ff))
- **test-runner:** Add `--maxTestRunnerReuse` support ([5919484](https://github.com/stryker-mutator/stryker/commit/59194841505e520ddc382ea4affc78ef16978e1b))

### BREAKING CHANGES

- **config:** exporting a function from stryker.conf.js is deprecated. Please export your config as an object instead, or use a stryker.conf.json file.

Co-authored-by: Nico Jansen <jansennico@gmail.com>

# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

### Bug Fixes

- **instrumenter:** ignore `declare` syntax ([b1faa16](https://github.com/stryker-mutator/stryker/commit/b1faa1603f68dded5d694cdb41b6e75b05ac9e1a))

### Features

- **core:** add `--cleanTempDir` cli option ([6ef792c](https://github.com/stryker-mutator/stryker/commit/6ef792c839c0464c7acbeb72560574dc94480eea))
- **instrumenter:** improve placement error ([12e097e](https://github.com/stryker-mutator/stryker/commit/12e097e287d24e41656d2b3897335b3f93654e5d))

# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

### Bug Fixes

- **core:** allow skipped tests when matching mutants ([#2487](https://github.com/stryker-mutator/stryker/issues/2487)) ([09eacee](https://github.com/stryker-mutator/stryker/commit/09eaceece587e4e583348fbec7682ba77715bd8c)), closes [#2485](https://github.com/stryker-mutator/stryker/issues/2485)
- **instrumenter:** don't mutate constructor blocks with initialized class properties ([#2484](https://github.com/stryker-mutator/stryker/issues/2484)) ([ca464a3](https://github.com/stryker-mutator/stryker/commit/ca464a31e180aada677464591154c41295fbc50c)), closes [#2474](https://github.com/stryker-mutator/stryker/issues/2474)
- **instrumenter:** place mutants in if statements ([#2481](https://github.com/stryker-mutator/stryker/issues/2481)) ([4df4102](https://github.com/stryker-mutator/stryker/commit/4df410263be09468323d7f64d95a8a839432e52f)), closes [#2469](https://github.com/stryker-mutator/stryker/issues/2469)

# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

### Bug Fixes

- **instrumenter:** skip `as` expressions ([#2471](https://github.com/stryker-mutator/stryker/issues/2471)) ([2432d84](https://github.com/stryker-mutator/stryker/commit/2432d8442bd783448568a92c57349ecab626def0))

# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

### Bug Fixes

- **jasmine-runner:** fix memory leaks ([457d807](https://github.com/stryker-mutator/stryker/commit/457d807989bd2a69a9e1b7bc33c3971a37c19737))
- **mocha-runner:** don't allow custom timeout ([#2463](https://github.com/stryker-mutator/stryker/issues/2463)) ([e90b563](https://github.com/stryker-mutator/stryker/commit/e90b5635907dfcd36de98d73fa6c2da31f69fbed))
- **mocha-runner:** fix memory leaks ([23eede2](https://github.com/stryker-mutator/stryker/commit/23eede22036c9efa502af8016e530af780a7cebb))
- **reporters:** correctly report avg tests/mutants ([#2458](https://github.com/stryker-mutator/stryker/issues/2458)) ([582e01b](https://github.com/stryker-mutator/stryker/commit/582e01befe7ce2effdcde86f2c3123ccaff89c18))

### Features

- **mutate:** a new default for `mutate` ([#2452](https://github.com/stryker-mutator/stryker/issues/2452)) ([673516d](https://github.com/stryker-mutator/stryker/commit/673516d3fb92534fc3aad62d17243b558fae3ba4)), closes [#2384](https://github.com/stryker-mutator/stryker/issues/2384)
- **typescript:** Disable type checking ([#2446](https://github.com/stryker-mutator/stryker/issues/2446)) ([3ff996b](https://github.com/stryker-mutator/stryker/commit/3ff996b7516b7782434d86aa9aecbee334978a7f)), closes [#2438](https://github.com/stryker-mutator/stryker/issues/2438)

# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

### Bug Fixes

- **input files:** support emojis in file names ([#2430](https://github.com/stryker-mutator/stryker/issues/2430)) ([139f9f3](https://github.com/stryker-mutator/stryker/commit/139f9f3ea9aa2349198cb824ceb444f7c6b013b6))
- **input files:** support emojis in file names ([#2433](https://github.com/stryker-mutator/stryker/issues/2433)) ([b5feae2](https://github.com/stryker-mutator/stryker/commit/b5feae2558ade9a1f2d947f7fd046033e4c9d996))

### Features

- **api:** rename test_runner2 -> test_runner ([#2442](https://github.com/stryker-mutator/stryker/issues/2442)) ([4d3ae97](https://github.com/stryker-mutator/stryker/commit/4d3ae9764dbd689c895b76e44f2eea76c82fabc8))
- **jest-runner:** switch mutants using env ([#2416](https://github.com/stryker-mutator/stryker/issues/2416)) ([cad01ba](https://github.com/stryker-mutator/stryker/commit/cad01baf9f4fc3bab2ae5244627586133fb618be))
- **karma-runner:** force bail = true in all cases ([ba928a1](https://github.com/stryker-mutator/stryker/commit/ba928a10d9e4c67ade9648927fb6b281ad2e3d55))
- **options:** deprecate old stryker options ([#2395](https://github.com/stryker-mutator/stryker/issues/2395)) ([7c637c8](https://github.com/stryker-mutator/stryker/commit/7c637c8714169a03facd42a7521f7670b7606a32))
- **reporter-api:** support mutation switching ([67f1ed5](https://github.com/stryker-mutator/stryker/commit/67f1ed52f4d17df4306362064180d267ed5445c7))
- **test-runner:** add `nrOfTests` metric ([0eea448](https://github.com/stryker-mutator/stryker/commit/0eea44892e2383e8b0a34c6267e2f455d604f55a))
- **wct-runner:** drop support for wct ([#2440](https://github.com/stryker-mutator/stryker/issues/2440)) ([7c55424](https://github.com/stryker-mutator/stryker/commit/7c55424a6deca5301af50206ea93905faaa0056b))

### Performance Improvements

- **express:** add benchmark express ([#2431](https://github.com/stryker-mutator/stryker/issues/2431)) ([7cfb8f1](https://github.com/stryker-mutator/stryker/commit/7cfb8f1568530439d8bbf40c87b9ce1ab1fa7e96))

### BREAKING CHANGES

- **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.
- **wct-runner:** The @stryker-mutator/wct-runner package is dropped in Stryker 4.0. Please see https://github.com/stryker-mutator/stryker/issues/2386 for more details. Feel free to keep using @stryker-mutator/wct-runner@3 or start a community fork. Note that [support for the web-component-tester itself is minimal](https://github.com/Polymer/tools/issues/3398), you might want to consider switching to a different test runner. Stryker still supports Mocha, Jest, Jasmine and Karma.
- **reporter-api:** The `onMutantTested` and `onAllMutantsTested` methods on the `Reporter` api have changed

# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)

### Bug Fixes

- **core:** exit process on error ([#2378](https://github.com/stryker-mutator/stryker/issues/2378)) ([af18a59](https://github.com/stryker-mutator/stryker/commit/af18a590fc916d75d54bcfaf2dda1d6a90bd4df8)), closes [#2315](https://github.com/stryker-mutator/stryker/issues/2315)
- **exit prematurely:** exit when no tests were executed ([#2380](https://github.com/stryker-mutator/stryker/issues/2380)) ([6885e16](https://github.com/stryker-mutator/stryker/commit/6885e16fad7699ba93e6ebbbf0755c7d98c50c5a))
- **instrumenter:** support anonymous function names ([#2388](https://github.com/stryker-mutator/stryker/issues/2388)) ([c7d150a](https://github.com/stryker-mutator/stryker/commit/c7d150ab1af4341bb59381ef55fa54eff0113a11)), closes [#2362](https://github.com/stryker-mutator/stryker/issues/2362)

### Features

- **core:** add ability to override file headers ([#2363](https://github.com/stryker-mutator/stryker/issues/2363)) ([430d6d3](https://github.com/stryker-mutator/stryker/commit/430d6d3d17fe2ad8e2cef3b858afa7efb86c2342))
- **core:** strip comments in sandbox ([#2365](https://github.com/stryker-mutator/stryker/issues/2365)) ([55f27f2](https://github.com/stryker-mutator/stryker/commit/55f27f29b6994096c9aad038958ee93e9fa0f035)), closes [#2364](https://github.com/stryker-mutator/stryker/issues/2364)
- **instrumenter:** add support for `.mjs` and `.cjs` file formats ([#2391](https://github.com/stryker-mutator/stryker/issues/2391)) ([5ba4c5c](https://github.com/stryker-mutator/stryker/commit/5ba4c5c93a721982019aa7e124e491decec2e9f0))
- **jest-runner:** remove deprecated project types ([#2361](https://github.com/stryker-mutator/stryker/issues/2361)) ([d0aa5c3](https://github.com/stryker-mutator/stryker/commit/d0aa5c3c2f676176d3fbceb24ab2cd17011c9ecf))
- **mocha:** deprecate mocha < v6 ([#2379](https://github.com/stryker-mutator/stryker/issues/2379)) ([fee0754](https://github.com/stryker-mutator/stryker/commit/fee0754c395ade4ee92d434963034e59ea5d180d))
- **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)

### BREAKING CHANGES

- **exit prematurely:** Stryker will now exit with exit code 1 when no tests were executed in the initial test run.
- **mocha:** Mocha@<6 is deprecated and support for it will be removed in Stryker v5
- **jest-runner:** Project types `react` and `react-ts` has been removed. Please use `create-react-app` and `create-react-app-ts` respectively

# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

### Bug Fixes

- **ArrowFunction mutator:** don't mutate () => undefined ([#2313](https://github.com/stryker-mutator/stryker/issues/2313)) ([310145e](https://github.com/stryker-mutator/stryker/commit/310145ec853a56b6520e0358861ba492b5dff0a6))
- **instrumenter:** don't mutate string literals in object properties ([#2354](https://github.com/stryker-mutator/stryker/issues/2354)) ([cd43952](https://github.com/stryker-mutator/stryker/commit/cd439522650fe59c1607d00d58d331b5dc45fe39))
- **mutator:** issue with block statement mutator ([#2342](https://github.com/stryker-mutator/stryker/issues/2342)) ([aaa4ff6](https://github.com/stryker-mutator/stryker/commit/aaa4ff6cd5bdfadef5047ec2c405ad0f385249ef)), closes [#2314](https://github.com/stryker-mutator/stryker/issues/2314)

### Features

- **command:** Support command test runner with mutation switching ([#2345](https://github.com/stryker-mutator/stryker/issues/2345)) ([59b1cfc](https://github.com/stryker-mutator/stryker/commit/59b1cfc06c4f8f5ec1e55dce4823e0f9c384b16c))
- **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))

# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

### Bug Fixes

- **Jest:** Notify users of lacking Jest support ([#2322](https://github.com/stryker-mutator/stryker/issues/2322)) ([0bbc0c1](https://github.com/stryker-mutator/stryker/commit/0bbc0c119ba5d661ba9751d241ba548293738aa8))

# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)

### Bug Fixes

- **buildCommand:** allow for a single command string in posix ([77b6a20](https://github.com/stryker-mutator/stryker/commit/77b6a209955bb71fffee61919cec6b3a14db2eff))
- **instrumenter:** don't mutate `require` ([963e289](https://github.com/stryker-mutator/stryker/commit/963e28921c48ec2d4113ded0eefde7049fff3263))
- **jasmine-runner:** update deprecated api calls ([#2250](https://github.com/stryker-mutator/stryker/issues/2250)) ([b6d6dfd](https://github.com/stryker-mutator/stryker/commit/b6d6dfdabf8db748660b9818415864de27d55a7f))
- **karma-runner:** mocha filtering with `/` ([#2290](https://github.com/stryker-mutator/stryker/issues/2290)) ([3918633](https://github.com/stryker-mutator/stryker/commit/3918633b21ff37d2e950df2cc14b8557ee7eb6b3))
- **reporter:** report event order ([#2311](https://github.com/stryker-mutator/stryker/issues/2311)) ([ceb73a8](https://github.com/stryker-mutator/stryker/commit/ceb73a83dddce0df1bd1c6b9f7e7e8e75fe77e31))
- **sandbox:** exec build command before symlink ([bd25cd6](https://github.com/stryker-mutator/stryker/commit/bd25cd6ce2f28fe4b1b1b3ac792d99a9742e438b))
- **typescript-checker:** support empty files ([#2310](https://github.com/stryker-mutator/stryker/issues/2310)) ([284a28c](https://github.com/stryker-mutator/stryker/commit/284a28cbe831ad4c4ed161f2d700fa88663120ca))

### Features

- **api:** add id to Mutant interface ([#2255](https://github.com/stryker-mutator/stryker/issues/2255)) ([cfc9053](https://github.com/stryker-mutator/stryker/commit/cfc90537d0b9815cba2b44b9681d171ca602766e))
- **api:** add new test runner api ([#2249](https://github.com/stryker-mutator/stryker/issues/2249)) ([bbbc308](https://github.com/stryker-mutator/stryker/commit/bbbc308806f46260ed0777ea2a33342ec12d105e))
- **api:** remove support for options editors ([5e56d0e](https://github.com/stryker-mutator/stryker/commit/5e56d0ea6982faf11048c8ca4bbb912ee17e88eb))
- **checker:** add checker api ([#2240](https://github.com/stryker-mutator/stryker/issues/2240)) ([d463f86](https://github.com/stryker-mutator/stryker/commit/d463f8639437c114da4fe30115652e8a470dd179)), closes [#1514](https://github.com/stryker-mutator/stryker/issues/1514) [#1980](https://github.com/stryker-mutator/stryker/issues/1980)
- **core:** add support for checker plugins ([#2285](https://github.com/stryker-mutator/stryker/issues/2285)) ([69358e1](https://github.com/stryker-mutator/stryker/commit/69358e1423701c730e29d303119a08d74081f340))
- **core:** support build command ([f71ba87](https://github.com/stryker-mutator/stryker/commit/f71ba87a7adfd85131e1dea5fb1d6f3d8bba76df))
- **html-parser:** add `// [@ts-nocheck](https://github.com/ts-nocheck)` to scripts ([8ceff31](https://github.com/stryker-mutator/stryker/commit/8ceff31aabda981551a5f5997e820fc9af76565d))
- **instrumenter:** add mutant placers ([#2224](https://github.com/stryker-mutator/stryker/issues/2224)) ([0e05025](https://github.com/stryker-mutator/stryker/commit/0e0502523a32ffbe836e93da9ade479b01393c5a))
- **instrumenter:** add parsers ([#2222](https://github.com/stryker-mutator/stryker/issues/2222)) ([3b57ef2](https://github.com/stryker-mutator/stryker/commit/3b57ef23dd5b348dcdff205600989aea2c7fbcf0))
- **instrumenter:** add the mutation testing instrumenter ([#2212](https://github.com/stryker-mutator/stryker/issues/2212)) ([197e177](https://github.com/stryker-mutator/stryker/commit/197e177cb730952b22d3e5929f4799c2bae476d7))
- **instrumenter:** add transformers ([#2234](https://github.com/stryker-mutator/stryker/issues/2234)) ([61c8fe6](https://github.com/stryker-mutator/stryker/commit/61c8fe65e35bb95b786a0e2bebbe57166ffbc480))
- **instrumenter:** allow override of babel plugins ([8758cfd](https://github.com/stryker-mutator/stryker/commit/8758cfdda8ac2bfa761568f55ddee48c2a23f0e0))
- **instrumenter:** implement `Instrumenter` class ([8df9172](https://github.com/stryker-mutator/stryker/commit/8df9172b95b6e277f44302469edb3c00324a02bd))
- **jasmine-runner:** implement new test runner api ([#2256](https://github.com/stryker-mutator/stryker/issues/2256)) ([871db8c](https://github.com/stryker-mutator/stryker/commit/871db8c24c3389133d9b4476acd33b0ddd956a36)), closes [#2249](https://github.com/stryker-mutator/stryker/issues/2249)
- **mutator:** remove `Mutator` API ([3ca89cf](https://github.com/stryker-mutator/stryker/commit/3ca89cf7e23af70f83e0c0ac02ab5241fc0790ff))
- **mutators:** add mutators to instrumenter package ([#2266](https://github.com/stryker-mutator/stryker/issues/2266)) ([3b87743](https://github.com/stryker-mutator/stryker/commit/3b87743645db9923d4c85146ea861aa1b7265447))
- **sandbox:** add ignore header to js files ([#2291](https://github.com/stryker-mutator/stryker/issues/2291)) ([3adde83](https://github.com/stryker-mutator/stryker/commit/3adde830deb8d4b471ae6fceafd603c9750419d7)), closes [#2276](https://github.com/stryker-mutator/stryker/issues/2276)
- **test-framework:** remove `TestFramework` API ([fe5e200](https://github.com/stryker-mutator/stryker/commit/fe5e200e1f7ad7a24ebceacb2a62c2be58ce6a4f))
- **transpiler:** remove `Transpiler` API ([06f668b](https://github.com/stryker-mutator/stryker/commit/06f668bf8660f78b12916b2236f3fd9bf86bf23b))
- **tsconfig:** rewrite tsconfig references ([#2292](https://github.com/stryker-mutator/stryker/issues/2292)) ([4ee4950](https://github.com/stryker-mutator/stryker/commit/4ee4950bebd8db9c2f5a514edee57de55c040526)), closes [#2276](https://github.com/stryker-mutator/stryker/issues/2276)
- **typescript-checker:** a typescript type checker plugin ([#2241](https://github.com/stryker-mutator/stryker/issues/2241)) ([42adb95](https://github.com/stryker-mutator/stryker/commit/42adb9561cdd10172f955fda044854bcc1b7b515)), closes [/github.com/stryker-mutator/stryker/blob/f44008993a543dc3f38ca99516f56d315fdcb735/packages/typescript/src/transpiler/TranspilingLanguageService.ts#L23](https://github.com//github.com/stryker-mutator/stryker/blob/f44008993a543dc3f38ca99516f56d315fdcb735/packages/typescript/src/transpiler/TranspilingLanguageService.ts/issues/L23) [#391](https://github.com/stryker-mutator/stryker/issues/391)

### BREAKING CHANGES

- **core:** \* `--maxConcurrentTestRunners` is now deprecated. Please use `--concurrency` instead.

## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)

### Bug Fixes

- **validation:** don't warn about the commandRunner options ([2128b9a](https://github.com/stryker-mutator/stryker/commit/2128b9ad5addb5617847234be2f7f34195671661))

# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

### Features

- **mocha-runner:** support mocha 8 ([#2259](https://github.com/stryker-mutator/stryker/issues/2259)) ([917d965](https://github.com/stryker-mutator/stryker/commit/917d965e72871a2199dd9b2d710d40b350509431))

## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

### Bug Fixes

- **ts:** support ts 3.9 on windows in the typescript-transpiler ([#2215](https://github.com/stryker-mutator/stryker/issues/2215)) ([0fab74f](https://github.com/stryker-mutator/stryker/commit/0fab74f4af97e6faf0eee0ba44f935af7c4ccbb5))

## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

### Bug Fixes

- **init:** use correct schema reference ([#2213](https://github.com/stryker-mutator/stryker/issues/2213)) ([136f538](https://github.com/stryker-mutator/stryker/commit/136f538c17140196b88ccaf80d3082546262a4e8))

## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

### Bug Fixes

- **options:** resolve false positives in unknown options warning ([#2208](https://github.com/stryker-mutator/stryker/issues/2208)) ([e3905f6](https://github.com/stryker-mutator/stryker/commit/e3905f6a4efa5aa32c4d76d09bff4692a35e78a9))

## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

### Bug Fixes

- remove duplicate package.json script ([#2198](https://github.com/stryker-mutator/stryker/issues/2198)) ([26beff2](https://github.com/stryker-mutator/stryker/commit/26beff22129c0e07e716a88ae513999949ded5ed))

# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)

### Bug Fixes

- **utils:** make sure `instanceof StrykerError` works ([a9dea8c](https://github.com/stryker-mutator/stryker/commit/a9dea8c638a61bd472e937b69bf37846074e09a1))
- **webpack-transpiler:** add support for cache-loader ([#2196](https://github.com/stryker-mutator/stryker/issues/2196)) ([0bcf98b](https://github.com/stryker-mutator/stryker/commit/0bcf98ba78a7a7923f53ccf75fdf4638fba62193))

### Features

- **api:** Deprecated Config in favor of StrykerOptions ([dccdd91](https://github.com/stryker-mutator/stryker/commit/dccdd9119743d776e2dc4b572a9e02b1524ef88b))
- **api:** export the StrykerOptions JSON schema ([0bb222d](https://github.com/stryker-mutator/stryker/commit/0bb222db07638ecf196eba9d8c88e086cd15239f))
- **init:** add reference to mono schema ([#2162](https://github.com/stryker-mutator/stryker/issues/2162)) ([61953c7](https://github.com/stryker-mutator/stryker/commit/61953c703631619b51442298e1cff8532c336d4a))
- **Jest:** support overriding config ([#2197](https://github.com/stryker-mutator/stryker/issues/2197)) ([d37b7d7](https://github.com/stryker-mutator/stryker/commit/d37b7d724fea7a62d93613d9579defbfdffcd180)), closes [#2155](https://github.com/stryker-mutator/stryker/issues/2155)
- **validation:** validate StrykerOptions using JSON schema ([5f05665](https://github.com/stryker-mutator/stryker/commit/5f0566581abdd1229dfe5d27a25a676bec93d8f8))
- **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))
- **validation:** hide stacktrace on validation error ([8c5ee88](https://github.com/stryker-mutator/stryker/commit/8c5ee889c7b06569bbfeb6a9557b8cecda16f0eb))
- **validation:** warn about unknown stryker config options ([#2164](https://github.com/stryker-mutator/stryker/issues/2164)) ([8c6fd97](https://github.com/stryker-mutator/stryker/commit/8c6fd972dc57e246d361132dc176920d380c91cc)), closes [#2103](https://github.com/stryker-mutator/stryker/issues/2103)

# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

### Bug Fixes

- **api:** allow for different api versions of File ([#2124](https://github.com/stryker-mutator/stryker/issues/2124)) ([589de85](https://github.com/stryker-mutator/stryker/commit/589de85361297999c8b5625e800783a18e6507e5))

### Features

- **mocha:** support mocha 7 ([#2114](https://github.com/stryker-mutator/stryker/issues/2114)) ([4a4d677](https://github.com/stryker-mutator/stryker/commit/4a4d677d8dd291cd063ed6b887d4d702f31e84d1)), closes [#2108](https://github.com/stryker-mutator/stryker/issues/2108)

## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

### Bug Fixes

- **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))

## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

### Bug Fixes

- **Peer dependencies:** set peer dependencies for v3 ([#2096](https://github.com/stryker-mutator/stryker/issues/2096)) ([8648c4d](https://github.com/stryker-mutator/stryker/commit/8648c4d9c70ce032841371c6041ebb76bf099948)), closes [#2095](https://github.com/stryker-mutator/stryker/issues/2095)

# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)

### Bug Fixes

- **api:** allow for different api versions of File ([#2042](https://github.com/stryker-mutator/stryker/issues/2042)) ([9d1fcc1](https://github.com/stryker-mutator/stryker/commit/9d1fcc17e3e8125d8aa9174e3092d4f9913cc656)), closes [#2025](https://github.com/stryker-mutator/stryker/issues/2025)
- **mocha:** support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)

### Features

- **api:** Document StrykerOptions in JSON schema ([4bdb7a1](https://github.com/stryker-mutator/stryker/commit/4bdb7a18e5ea388a55f00643593ea5efdde1b22f))
- **config:** Allow a `stryker.conf.json` as default config file. ([#2092](https://github.com/stryker-mutator/stryker/issues/2092)) ([2279813](https://github.com/stryker-mutator/stryker/commit/2279813dec4f9fabbfe9dcd521dc2e19d5902dc6))
- **core:** exit code 1 when error in initial run ([49c5162](https://github.com/stryker-mutator/stryker/commit/49c5162461b5240a6c4204305cb21a7dd74d5172))
- **Dashboard reporter:** upload full html report by default ([#2039](https://github.com/stryker-mutator/stryker/issues/2039)) ([e23dbe1](https://github.com/stryker-mutator/stryker/commit/e23dbe1bcbe5d9b5491ba7c3a1380b4e20ea4c38))
- **excludedMutations:** remove deprecated mutation names ([#2027](https://github.com/stryker-mutator/stryker/issues/2027)) ([6f7bfe1](https://github.com/stryker-mutator/stryker/commit/6f7bfe13e8ec681d73c97d9b7fbd3f88a313ed6d))
- **HtmlReporter:** include the html reporter in the core package and add it to the default reporters ([#2036](https://github.com/stryker-mutator/stryker/issues/2036)) ([09702d9](https://github.com/stryker-mutator/stryker/commit/09702d9a05387f407d8fc43d21db38b3a14cbec7)), closes [#1919](https://github.com/stryker-mutator/stryker/issues/1919)
- **Initializer:** Initialize config file as JSON by default ([#2093](https://github.com/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.com/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.com/stryker-mutator/stryker/issues/2000)
- **jest-runner:** support Jest 25 ([b45e872](https://github.com/stryker-mutator/stryker/commit/b45e8725fe19b3568e0d358d4a6add32bafed425)), closes [#1983](https://github.com/stryker-mutator/stryker/issues/1983)
- **karma-runner:** disable client.clearContext ([#2048](https://github.com/stryker-mutator/stryker/issues/2048)) ([27c0787](https://github.com/stryker-mutator/stryker/commit/27c0787e1b5e9b886dc530afcb0de19637e308c6))
- **karma-runner:** use ChromeHeadless as the default browser ([#2035](https://github.com/stryker-mutator/stryker/issues/2035)) ([18bf9b6](https://github.com/stryker-mutator/stryker/commit/18bf9b603fdc0b4b0049c32dfaf953603980a662))
- **promisified fs:** use node 10 promisified functions ([#2028](https://github.com/stryker-mutator/stryker/issues/2028)) ([1c57d8f](https://github.com/stryker-mutator/stryker/commit/1c57d8f4620c2392e167f45fa20aa6acbd0c7a7d))
- **react:** change react to create-react-app ([#1978](https://github.com/stryker-mutator/stryker/issues/1978)) ([7f34f28](https://github.com/stryker-mutator/stryker/commit/7f34f28dda821da561ae7ea5d041bb58fca4c011))
- **Reporter.onScoreCalculated:** remove deprecated onScoreCalculatedevent ([#2026](https://github.com/stryker-mutator/stryker/issues/2026)) ([9fa4175](https://github.com/stryker-mutator/stryker/commit/9fa41757d7bed58c98bc3fbd0c8c861670fbd025))

### BREAKING CHANGES

- **core:** Stryker now exists with exitCode `1` if an error of any kind occurs.
- **karma-runner:** The @stryker-mutator/karma-runner will now use ChromeHeadless by default (instead of PhantomJS)
- **Reporter.onScoreCalculated:** Please use the `onMutationTestReportReady` event and the `mutation-testing-metrics` npm package to calculate the mutation testing report metrics.

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
  onMutationTestingReportReady(report) {
    const reportMetrics = calculateMetrics(report.files);
    // => do stuff with report metrics
  }
}
```

- **HtmlReporter:** the `html` reporter is now enabled by default. If you don't want to use it, be sure to override the `reporters` configuration option.

```json
{
  "reporters": ["progress", "clear-text"]
}
```

- **Dashboard reporter:** The dashboard reporter will now upload a full report by default. If you don't want that, you can disable it with:

```json
{
  "dashboard": {
    "reportType": "mutationScore"
  }
}
```

- **excludedMutations:** removes auto-fix for the old names of mutations.

### Migrating:

Almost every mutator has been renamed and/or split. Stryker will warn you about any deprecated mutator names in the `mutator.excludedMutations` section of your config.

To migrate, please run stryker to see if your project is affected. If this is the case, please take a look at the mutator types on the handbook (see above).

These are the changes:

| Old mutation           | New mutation(s)                                       |
| ---------------------- | ----------------------------------------------------- |
| ArrayLiteral           | ArrayDeclaration                                      |
| ArrayNewExpression     | ArrayDeclaration                                      |
| BinaryExpression       | ArithmeticOperator, EqualityOperator, LogicalOperator |
| Block                  | BlockStatement                                        |
| BooleanSubstitution    | BooleanLiteral                                        |
| DoStatement            | ConditionalExpression                                 |
| ForStatement           | ConditionalExpression                                 |
| IfStatement            | ConditionalExpression                                 |
| PrefixUnaryExpression  | UnaryOperator, UpdateOperator, BooleanLiteral         |
| PostfixUnaryExpression | UpdateOperator                                        |
| SwitchCase             | ConditionalExpression                                 |
| WhileStatement         | ConditionalExpression                                 |

### New mutations

Due to the migration, some new mutations were added to the **javascript** mutator.

- The mutation _ArrayDeclaration_ will now mutate `new Array()` to `new Array([])`
- The mutation _ArrayDeclaration_ will now mutate `[]` to `["Stryker was here"]`

These mutations were already performed by the typescript mutator.

- **promisified fs:** removed fsAsPromised from @stryker-mutator/util

# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

### Features

- **.gitignore:** add Stryker patterns to .gitignore file during initialization ([#1848](https://github.com/stryker-mutator/stryker/issues/1848)) ([854aee0](https://github.com/stryker-mutator/stryker/commit/854aee0))
- **arrow mutations:** add arrow mutations and refactor JavaScript mutators ([#1898](https://github.com/stryker-mutator/stryker/issues/1898)) ([898d38b](https://github.com/stryker-mutator/stryker/commit/898d38b))
- **TypeScript mutator:** mutate Array constructor calls without the new keyword ([#1903](https://github.com/stryker-mutator/stryker/issues/1903)) ([aecd944](https://github.com/stryker-mutator/stryker/commit/aecd944)), closes [#1902](https://github.com/stryker-mutator/stryker/issues/1902)

# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

### Features

- **dashboard-reporter:** add github actions ci provider ([#1869](https://github.com/stryker-mutator/stryker/issues/1869)) ([b38b30d](https://github.com/stryker-mutator/stryker/commit/b38b30d))
- **excludedMutations:** Implement new naming of mutators ([#1855](https://github.com/stryker-mutator/stryker/issues/1855)) ([c9b3bcb](https://github.com/stryker-mutator/stryker/commit/c9b3bcb))
- **json config:** support json-file config ([#1853](https://github.com/stryker-mutator/stryker/issues/1853)) ([49495ef](https://github.com/stryker-mutator/stryker/commit/49495ef))
- **progress-reporter:** improve reported progress ux ([d7a6f88](https://github.com/stryker-mutator/stryker/commit/d7a6f88))
- **report:** support upload of full report to dashboard ([#1783](https://github.com/stryker-mutator/stryker/issues/1783)) ([fbb8102](https://github.com/stryker-mutator/stryker/commit/fbb8102))

# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

### Bug Fixes

- **core:** undefined reference error in coverage recording ([0a68c9c](https://github.com/stryker-mutator/stryker/commit/0a68c9c))
- **perf/angular-cli:** upgrade to latest angular version and fix bugs ([#1842](https://github.com/stryker-mutator/stryker/issues/1842)) ([4f81550](https://github.com/stryker-mutator/stryker/commit/4f81550))

### Features

- **babel-transpiler:** support object-style babel.config.js ([#1762](https://github.com/stryker-mutator/stryker/issues/1762)) ([31410c8](https://github.com/stryker-mutator/stryker/commit/31410c8))

## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package stryker-parent

# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

### Bug Fixes

- edge cases, duplication, log output ([#1720](https://github.com/stryker-mutator/stryker/issues/1720)) ([7f42d34](https://github.com/stryker-mutator/stryker/commit/7f42d34))
- **jest-runner:** improve error message for missing react-scripts ([#1694](https://github.com/stryker-mutator/stryker/issues/1694)) ([313e3bf](https://github.com/stryker-mutator/stryker/commit/313e3bf))
- **tempDir:** don't resolve temp dir as input file ([#1710](https://github.com/stryker-mutator/stryker/issues/1710)) ([bbdd02a](https://github.com/stryker-mutator/stryker/commit/bbdd02a))

### Features

- **javascript-mutator:** allow to override babel plugins ([#1764](https://github.com/stryker-mutator/stryker/issues/1764)) ([ddb3d60](https://github.com/stryker-mutator/stryker/commit/ddb3d60))
- **mutant-matcher:** lower memory usage ([#1794](https://github.com/stryker-mutator/stryker/issues/1794)) ([16294e5](https://github.com/stryker-mutator/stryker/commit/16294e5))
- **progress-reporter:** show timed out mutant count ([#1818](https://github.com/stryker-mutator/stryker/issues/1818)) ([067df6d](https://github.com/stryker-mutator/stryker/commit/067df6d))
- **typescript:** do not mutate `interfaces` ([#1662](https://github.com/stryker-mutator/stryker/issues/1662)) ([86b2ffe](https://github.com/stryker-mutator/stryker/commit/86b2ffe))

# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

### Features

- **mocha:** support mocha 6.2 ([feddcf1](https://github.com/stryker-mutator/stryker/commit/feddcf1))

## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

### Bug Fixes

- **child process:** cleanup after dispose ([#1636](https://github.com/stryker-mutator/stryker/issues/1636)) ([3fd5db9](https://github.com/stryker-mutator/stryker/commit/3fd5db9))
- **child process proxy:** OutOfMemory detection ([#1635](https://github.com/stryker-mutator/stryker/issues/1635)) ([4324d9f](https://github.com/stryker-mutator/stryker/commit/4324d9f))
- **dispose:** fix race condition in dispose action ([124ef6a](https://github.com/stryker-mutator/stryker/commit/124ef6a)), closes [#1542](https://github.com/stryker-mutator/stryker/issues/1542)

## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

### Bug Fixes

- **html:** set utf-8 charset ([#1592](https://github.com/stryker-mutator/stryker/issues/1592)) ([fb858ca](https://github.com/stryker-mutator/stryker/commit/fb858ca))
- **inquirer:** fix inquirer types ([#1563](https://github.com/stryker-mutator/stryker/issues/1563)) ([37ca23c](https://github.com/stryker-mutator/stryker/commit/37ca23c))

# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)

### Bug Fixes

- **vue:** only mutate Vue files with <script> blocks ([#1540](https://github.com/stryker-mutator/stryker/issues/1540)) ([ee4d27c](https://github.com/stryker-mutator/stryker/commit/ee4d27c))

### Features

- **deps:** update source-map dep to current major release ([45fa0f8](https://github.com/stryker-mutator/stryker/commit/45fa0f8))
- **es2017:** output es2017 code ([#1518](https://github.com/stryker-mutator/stryker/issues/1518)) ([e85561e](https://github.com/stryker-mutator/stryker/commit/e85561e))
- **formatting:** remove dependency on prettier ([#1552](https://github.com/stryker-mutator/stryker/issues/1552)) ([24543d3](https://github.com/stryker-mutator/stryker/commit/24543d3)), closes [#1261](https://github.com/stryker-mutator/stryker/issues/1261)
- **mocha:** deprecate mocha version 5 and below ([#1529](https://github.com/stryker-mutator/stryker/issues/1529)) ([1c55350](https://github.com/stryker-mutator/stryker/commit/1c55350))
- **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))

### BREAKING CHANGES

- **es2017:** changed TypeScript output target from es5 to es2017. This requires a NodeJS runtime of version 8 or higher.
- **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.
- **mocha:** the use of mocha version 5 and below is deprecated. Please upgrade to mocha 6 or above. See [their changelog](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#600--2019-02-18) for more information about upgrading.

## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

### Bug Fixes

- **clean up:** prevent sandbox creation after dispose ([#1527](https://github.com/stryker-mutator/stryker/issues/1527)) ([73fc0a8](https://github.com/stryker-mutator/stryker/commit/73fc0a8))

# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

### Bug Fixes

- **dispose:** clean up child processes in alternative flows ([#1520](https://github.com/stryker-mutator/stryker/issues/1520)) ([31ee085](https://github.com/stryker-mutator/stryker/commit/31ee085))
- **html:** load report json from a js file ([#1485](https://github.com/stryker-mutator/stryker/issues/1485)) ([9bee2a7](https://github.com/stryker-mutator/stryker/commit/9bee2a7)), closes [#1482](https://github.com/stryker-mutator/stryker/issues/1482)

### Features

- **javascript-mutator:** allow decorators ([#1474](https://github.com/stryker-mutator/stryker/issues/1474)) ([f0dd430](https://github.com/stryker-mutator/stryker/commit/f0dd430))
- **mocha 6:** support all config formats ([#1511](https://github.com/stryker-mutator/stryker/issues/1511)) ([baa374d](https://github.com/stryker-mutator/stryker/commit/baa374d))

# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

### Bug Fixes

- **deps:** add mutation-testing-report-schema ([3d40d91](https://github.com/stryker-mutator/stryker/commit/3d40d91))
- **typescript:** don't mutate `declare` statements ([#1458](https://github.com/stryker-mutator/stryker/issues/1458)) ([aae3afe](https://github.com/stryker-mutator/stryker/commit/aae3afe))

### Features

- **babel-transpiler:** support .js babel config files ([#1422](https://github.com/stryker-mutator/stryker/issues/1422)) ([9e321f0](https://github.com/stryker-mutator/stryker/commit/9e321f0))
- **html-reporter:** use mutation-testing-elements ([2f6df38](https://github.com/stryker-mutator/stryker/commit/2f6df38))
- **peer-dep:** update stryker core to v1.2 ([d798b19](https://github.com/stryker-mutator/stryker/commit/d798b19))
- **reporter:** add `mutationReportReady` event ([044158d](https://github.com/stryker-mutator/stryker/commit/044158d))
- **reporter:** implement `mutationTestReport` ([16ba76b](https://github.com/stryker-mutator/stryker/commit/16ba76b))

## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

### Bug Fixes

- **broadcast-reporter:** log error detail ([#1461](https://github.com/stryker-mutator/stryker/issues/1461)) ([2331847](https://github.com/stryker-mutator/stryker/commit/2331847))

# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

### Bug Fixes

- **duplicate files:** make transpile always result in unique file names ([#1405](https://github.com/stryker-mutator/stryker/issues/1405)) ([a3018d2](https://github.com/stryker-mutator/stryker/commit/a3018d2))
- **presets:** install v1.x dependencies instead of v0.x ([#1434](https://github.com/stryker-mutator/stryker/issues/1434)) ([7edda46](https://github.com/stryker-mutator/stryker/commit/7edda46))

### Features

- **jest-runner:** disable notifications ([#1419](https://github.com/stryker-mutator/stryker/issues/1419)) ([948166b](https://github.com/stryker-mutator/stryker/commit/948166b))

## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

### Bug Fixes

- **jest-runner:** mark 'todo' tests as skipped ([#1420](https://github.com/stryker-mutator/stryker/issues/1420)) ([26d813f](https://github.com/stryker-mutator/stryker/commit/26d813f))

## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)

### Bug Fixes

- **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)

## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

### Bug Fixes

- **api:** remove implicit typed inject dependency ([#1399](https://github.com/stryker-mutator/stryker/issues/1399)) ([5cae595](https://github.com/stryker-mutator/stryker/commit/5cae595))
