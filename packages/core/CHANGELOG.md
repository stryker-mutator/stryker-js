# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.0.0](https://github.com/stryker-mutator/stryker-js/compare/v7.3.0...v8.0.0) (2023-11-30)

### Bug Fixes

- **core:** short circuit test executor when no tests and allowEmpty ([#4477](https://github.com/stryker-mutator/stryker-js/issues/4477)) ([ce3e5cd](https://github.com/stryker-mutator/stryker-js/commit/ce3e5cdd2c3abcf4576fad485f6f86b11895caf1))
- **deps:** update dependency emoji-regex to v10 ([#4496](https://github.com/stryker-mutator/stryker-js/issues/4496)) ([418688b](https://github.com/stryker-mutator/stryker-js/commit/418688b8095afa380e72e4e5453155b84dc9d96d))
- **deps:** update mutation-testing-elements monorepo to v2.0.5 ([#4536](https://github.com/stryker-mutator/stryker-js/issues/4536)) ([45e3ae6](https://github.com/stryker-mutator/stryker-js/commit/45e3ae62427ea59dd5ddd42016ecf93b6ecf7e44))

### Features

- **init:** add svelte custom initializer ([#4625](https://github.com/stryker-mutator/stryker-js/issues/4625)) ([418722d](https://github.com/stryker-mutator/stryker-js/commit/418722dfe9155b3db531b5f580edb8d267c6ab38))
- **node:** drop official support for node 16 ([#4542](https://github.com/stryker-mutator/stryker-js/issues/4542)) ([e190207](https://github.com/stryker-mutator/stryker-js/commit/e190207e25926179c1a3ed2c0ff97a13720c57bd))
- **svelte:** support mutating `.svelte` files ([0ef9a7f](https://github.com/stryker-mutator/stryker-js/commit/0ef9a7f5045799c39f7c6312c73a8d0345236615))

### BREAKING CHANGES

- **node:** NodeJS 16 is no longer supported. Please use NodeJS 18 or higher. See https://nodejs.org/en/about/previous-releases

# [7.3.0](https://github.com/stryker-mutator/stryker-js/compare/v7.2.0...v7.3.0) (2023-10-15)

### Bug Fixes

- **core:** disableTypeChecks true only forces ts-like file match ([#4485](https://github.com/stryker-mutator/stryker-js/issues/4485)) ([31f3411](https://github.com/stryker-mutator/stryker-js/commit/31f3411276e1251863fb0bb874353e5a3fab32a6))
- **deps:** update dependency commander to ~11.1.0 ([#4483](https://github.com/stryker-mutator/stryker-js/issues/4483)) ([ab03c0d](https://github.com/stryker-mutator/stryker-js/commit/ab03c0d32562dac46e7b2eac2a3c6aa7d2f7a8ac))
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

## [7.1.1](https://github.com/stryker-mutator/stryker-js/compare/v7.1.0...v7.1.1) (2023-07-15)

### Bug Fixes

- **deps:** update dependency chalk to v5 ([#4343](https://github.com/stryker-mutator/stryker-js/issues/4343)) ([ed265e5](https://github.com/stryker-mutator/stryker-js/commit/ed265e55d14ecefea876c62c9408ba688849545f))
- **deps:** update dependency tslib to v2.6.0 ([#4335](https://github.com/stryker-mutator/stryker-js/issues/4335)) ([e4c00ef](https://github.com/stryker-mutator/stryker-js/commit/e4c00ef9cddcc72b1bf0df5f10893933caaed7ef))

# [7.1.0](https://github.com/stryker-mutator/stryker-js/compare/v7.0.2...v7.1.0) (2023-06-24)

### Bug Fixes

- **deps:** update dependency commander to v11 ([#4304](https://github.com/stryker-mutator/stryker-js/issues/4304)) ([f9d5673](https://github.com/stryker-mutator/stryker-js/commit/f9d567383584929da43b8dec99d4ac9b2762cb11))
- **deps:** update dependency glob to v10.3.0 ([#4321](https://github.com/stryker-mutator/stryker-js/issues/4321)) ([72615b6](https://github.com/stryker-mutator/stryker-js/commit/72615b66517ab053df040a6cfbecc20da478e8b6))

### Features

- **init:** use registry.npmjs.com for queries ([#4298](https://github.com/stryker-mutator/stryker-js/issues/4298)) ([a952edf](https://github.com/stryker-mutator/stryker-js/commit/a952edf7795aecc8119215d1a8662c61b917dc0b))
- **init:** use vitest runner for vue projects ([#4327](https://github.com/stryker-mutator/stryker-js/issues/4327)) ([ab7313d](https://github.com/stryker-mutator/stryker-js/commit/ab7313d113b8144e25401e33c3f29b1b82e5db45))

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

### Bug Fixes

- **deps:** update dependency get-port to v7 ([#4260](https://github.com/stryker-mutator/stryker-js/issues/4260)) ([c9d384c](https://github.com/stryker-mutator/stryker-js/commit/c9d384c5894cf22c61eb108629a3caf7a77208e4))
- **deps:** update dependency tslib to v2.5.3 ([#4255](https://github.com/stryker-mutator/stryker-js/issues/4255)) ([8084d15](https://github.com/stryker-mutator/stryker-js/commit/8084d15ded945958ac3b5b27935cc2f3822f5bc8))

## [7.0.1](https://github.com/stryker-mutator/stryker-js/compare/v7.0.0...v7.0.1) (2023-06-03)

**Note:** Version bump only for package @stryker-mutator/core

# [7.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.4.2...v7.0.0) (2023-06-02)

### Bug Fixes

- **core:** improve no-mutate warning ([#4248](https://github.com/stryker-mutator/stryker-js/issues/4248)) ([6bf7a56](https://github.com/stryker-mutator/stryker-js/commit/6bf7a565bff2c730ed70ad64e5432de2d503864a))
- **deps:** update dependency inquirer to ~9.2.0 ([#4137](https://github.com/stryker-mutator/stryker-js/issues/4137)) ([d985780](https://github.com/stryker-mutator/stryker-js/commit/d9857800c94002b87d399d126160a777318e5daa))
- **deps:** update dependency minimatch to v8 ([#4079](https://github.com/stryker-mutator/stryker-js/issues/4079)) ([af4a62c](https://github.com/stryker-mutator/stryker-js/commit/af4a62cb750648d23e1e7a2e64fbb5ba5ae6cc47))
- **deps:** update dependency mutation-testing-elements to v2 ([#4148](https://github.com/stryker-mutator/stryker-js/issues/4148)) ([50071e6](https://github.com/stryker-mutator/stryker-js/commit/50071e6448656fbc55a0c62d38779056a5847b97))
- **deps:** update dependency tslib to v2.5.2 ([#4241](https://github.com/stryker-mutator/stryker-js/issues/4241)) ([4cd2a86](https://github.com/stryker-mutator/stryker-js/commit/4cd2a86503a243fd2998bc72245b8bda00d30d49))
- **deps:** update mutation-testing-elements monorepo to v2.0.1 ([#4182](https://github.com/stryker-mutator/stryker-js/issues/4182)) ([c1b7312](https://github.com/stryker-mutator/stryker-js/commit/c1b7312a238b67f43630101b084ff33780eda1c5))
- **deps:** update mutation-testing-metrics and mutation-report-schema to v2 ([#4154](https://github.com/stryker-mutator/stryker-js/issues/4154)) ([9b77a3f](https://github.com/stryker-mutator/stryker-js/commit/9b77a3f6fdeb7036b1e15610f03dd8c85a502670))
- **incremental:** correctly identify removed test files ([#4134](https://github.com/stryker-mutator/stryker-js/issues/4134)) ([7342ac6](https://github.com/stryker-mutator/stryker-js/commit/7342ac6cb4b6c09207e9ba84da5c85a24bcc62f4))
- **Reporter API:** use 1-based locations with `onMutantTested` ([#4158](https://github.com/stryker-mutator/stryker-js/issues/4158)) ([f5227e0](https://github.com/stryker-mutator/stryker-js/commit/f5227e0907efcc7433dbc93848f1f9057fb86978))

### chore

- **esm:** use "exports" and module "Node16" ([#4171](https://github.com/stryker-mutator/stryker-js/issues/4171)) ([cdf4a34](https://github.com/stryker-mutator/stryker-js/commit/cdf4a342b73d922423eb46a919eb3b38c4c43c46))

### Features

- **config:** add `--allowEmpty` option ([#4198](https://github.com/stryker-mutator/stryker-js/issues/4198)) ([44e355e](https://github.com/stryker-mutator/stryker-js/commit/44e355ee727bbceff1a4069055844c49c0ea2118))
- **config:** add `'always'` option to `cleanTempDir` ([#4187](https://github.com/stryker-mutator/stryker-js/issues/4187)) ([f02efb2](https://github.com/stryker-mutator/stryker-js/commit/f02efb2db08d13be132c0bd318dfa6d3f6399788))
- **node:** Drop support for node 14 ([#4105](https://github.com/stryker-mutator/stryker-js/issues/4105)) ([a88744f](https://github.com/stryker-mutator/stryker-js/commit/a88744f1a5fa47274ee0f30abc635831b18113fa))
- **reporter-api:** remove `onAllMutantsTested` ([#4234](https://github.com/stryker-mutator/stryker-js/issues/4234)) ([762c023](https://github.com/stryker-mutator/stryker-js/commit/762c023e5ac0ae6e2967be0458663c41d31e82ea))
- **type-checking:** disable type check by default ([#4246](https://github.com/stryker-mutator/stryker-js/issues/4246)) ([d45350a](https://github.com/stryker-mutator/stryker-js/commit/d45350ad2440d455b7ba215aae1f87712e22fdc5))

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
- **deps:** update dependency execa to v7.1.1 ([#4025](https://github.com/stryker-mutator/stryker-js/issues/4025)) ([13bc0b5](https://github.com/stryker-mutator/stryker-js/commit/13bc0b56cf5c02a17429d805ddd1bf9f5f77725b))
- **deps:** update dependency log4js to ~6.9.0 ([#3988](https://github.com/stryker-mutator/stryker-js/issues/3988)) ([fca777f](https://github.com/stryker-mutator/stryker-js/commit/fca777f40185cbcbc3cd2b7bff7652a56823324c))
- **progress reporter:** improve ETC prediction ([#4024](https://github.com/stryker-mutator/stryker-js/issues/4024)) ([956bbe9](https://github.com/stryker-mutator/stryker-js/commit/956bbe9a7ae3afb2e339f9027fe553c428c0c195)), closes [#4018](https://github.com/stryker-mutator/stryker-js/issues/4018)

## [6.4.1](https://github.com/stryker-mutator/stryker-js/compare/v6.4.0...v6.4.1) (2023-02-17)

**Note:** Version bump only for package @stryker-mutator/core

# [6.4.0](https://github.com/stryker-mutator/stryker-js/compare/v6.3.1...v6.4.0) (2023-02-17)

### Bug Fixes

- **deps:** update dependency commander to v10 ([#3936](https://github.com/stryker-mutator/stryker-js/issues/3936)) ([e8af5a4](https://github.com/stryker-mutator/stryker-js/commit/e8af5a4f8388c5ad9bf0e3c113b350239215b749))
- **deps:** update dependency execa to v7 ([#3975](https://github.com/stryker-mutator/stryker-js/issues/3975)) ([6c36120](https://github.com/stryker-mutator/stryker-js/commit/6c361206520f0f22e9b3576ff0e3e3e2ac014b7d))
- **deps:** update dependency glob to ~8.1.0 ([#3945](https://github.com/stryker-mutator/stryker-js/issues/3945)) ([edb767a](https://github.com/stryker-mutator/stryker-js/commit/edb767a20df6e3acf203492106caf642749e37bb))
- **deps:** update dependency mkdirp to v2 ([#3946](https://github.com/stryker-mutator/stryker-js/issues/3946)) ([0ee9018](https://github.com/stryker-mutator/stryker-js/commit/0ee901820868562f979a60ae3623b6ebc3c2b3a4))
- **deps:** update dependency mutation-testing-elements to v1.7.14 ([#3969](https://github.com/stryker-mutator/stryker-js/issues/3969)) ([2f3f481](https://github.com/stryker-mutator/stryker-js/commit/2f3f4819935fa03313d33afa32fd0af229eaa5ca))
- **deps:** update dependency mutation-testing-metrics to v1.7.14 ([#3970](https://github.com/stryker-mutator/stryker-js/issues/3970)) ([ddf32ee](https://github.com/stryker-mutator/stryker-js/commit/ddf32ee7581cc6169390022f933f593b7049bd3e))
- **deps:** update dependency mutation-testing-report-schema to v1.7.14 ([#3971](https://github.com/stryker-mutator/stryker-js/issues/3971)) ([a0d5743](https://github.com/stryker-mutator/stryker-js/commit/a0d57431e3a3c8b29ef53a9ef80f46aaf2900678))
- **deps:** update dependency tslib to ~2.5.0 ([#3952](https://github.com/stryker-mutator/stryker-js/issues/3952)) ([7548287](https://github.com/stryker-mutator/stryker-js/commit/7548287ee000bc09f88e6f1f0848e6e8e625bbb5))
- **project reader:** ignore configured output files by default. ([#3894](https://github.com/stryker-mutator/stryker-js/issues/3894)) ([2ff2f07](https://github.com/stryker-mutator/stryker-js/commit/2ff2f07b37007a359f453f987563877bc831beaf))

## [6.3.1](https://github.com/stryker-mutator/stryker-js/compare/v6.3.0...v6.3.1) (2022-12-18)

### Bug Fixes

- **deps:** update dependency chalk to ~5.2.0 ([#3898](https://github.com/stryker-mutator/stryker-js/issues/3898)) ([c325272](https://github.com/stryker-mutator/stryker-js/commit/c3252726204b1ad4b3e28a64c12a5c48f0a6cd7e))
- **diff:** last test generation ([#3910](https://github.com/stryker-mutator/stryker-js/issues/3910)) ([f88b038](https://github.com/stryker-mutator/stryker-js/commit/f88b03811001f2e393134c51b1603b315d892ecb))

# [6.3.0](https://github.com/stryker-mutator/stryker-js/compare/v6.2.3...v6.3.0) (2022-10-30)

### Bug Fixes

- **deps:** update dependency chalk to ~5.1.0 ([#3773](https://github.com/stryker-mutator/stryker-js/issues/3773)) ([973dc7b](https://github.com/stryker-mutator/stryker-js/commit/973dc7ba88a8d3af1a9dab212aaa9e6820eb3bea))

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

- **deps:** update dependency log4js to ~6.7.0 ([#3758](https://github.com/stryker-mutator/stryker-js/issues/3758)) ([535311d](https://github.com/stryker-mutator/stryker-js/commit/535311dca610f54ecd55d75a59b436dcdf0f8e95))

## [6.2.2](https://github.com/stryker-mutator/stryker-js/compare/v6.2.1...v6.2.2) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/core

## [6.2.1](https://github.com/stryker-mutator/stryker-js/compare/v6.2.0...v6.2.1) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/core

# [6.2.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0) (2022-09-06)

### Bug Fixes

- **deps:** update dependency log4js to ~6.6.0 ([#3628](https://github.com/stryker-mutator/stryker-js/issues/3628)) ([201bba2](https://github.com/stryker-mutator/stryker-js/commit/201bba23bad2abe6f9bc66dbd88f614bb4433137))
- **json-report:** make all file paths relative in report ([#3617](https://github.com/stryker-mutator/stryker-js/issues/3617)) ([d51f1a9](https://github.com/stryker-mutator/stryker-js/commit/d51f1a9d0e7cc705f6938fe509411623958210e9))

### Features

- **incremental:** add incremental mode ([#3609](https://github.com/stryker-mutator/stryker-js/issues/3609)) ([82bea56](https://github.com/stryker-mutator/stryker-js/commit/82bea5604c81c1ccf76d44827ad3922cfb61463b))

# [6.2.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0-beta.0) (2022-06-28)

### Features

- **incremental:** add incremental mode ([04cf8a2](https://github.com/stryker-mutator/stryker-js/commit/04cf8a2f87fea5ebe941a1357636389193d7dc13))

## [6.1.2](https://github.com/stryker-mutator/stryker-js/compare/v6.1.1...v6.1.2) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/core

## [6.1.1](https://github.com/stryker-mutator/stryker-js/compare/v6.1.0...v6.1.1) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/core

# [6.1.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.2...v6.1.0) (2022-06-27)

### Bug Fixes

- **deps:** update dependency commander to ~9.3.0 ([#3546](https://github.com/stryker-mutator/stryker-js/issues/3546)) ([1142f11](https://github.com/stryker-mutator/stryker-js/commit/1142f11209c481b602845d8068cde5bec57631ac))
- **deps:** update dependency file-url to v4 ([#3555](https://github.com/stryker-mutator/stryker-js/issues/3555)) ([658f00e](https://github.com/stryker-mutator/stryker-js/commit/658f00e6825c3229d18f9a45e79787d5e6c0fea1))
- **deps:** update dependency get-port to v6 ([#3556](https://github.com/stryker-mutator/stryker-js/issues/3556)) ([2cae23f](https://github.com/stryker-mutator/stryker-js/commit/2cae23f0bdb35143519134e0b0d21939b2b98a22))
- **deps:** update dependency glob to v8.0.3 ([#3531](https://github.com/stryker-mutator/stryker-js/issues/3531)) ([bb5611a](https://github.com/stryker-mutator/stryker-js/commit/bb5611abc762022de70098e9bd921ccc61427863))
- **deps:** update dependency inquirer to v9 ([#3592](https://github.com/stryker-mutator/stryker-js/issues/3592)) ([db0bd34](https://github.com/stryker-mutator/stryker-js/commit/db0bd34360de8b1d9f11b2226d2d7634cb4087d9))
- **deps:** update dependency log4js to ~6.5.0 ([#3547](https://github.com/stryker-mutator/stryker-js/issues/3547)) ([67df3f0](https://github.com/stryker-mutator/stryker-js/commit/67df3f0618e322e2e08eb937ff8a6cfe33c74b58))
- **deps:** update dependency minimatch to ~3.1.0 ([#3549](https://github.com/stryker-mutator/stryker-js/issues/3549)) ([a4e5c43](https://github.com/stryker-mutator/stryker-js/commit/a4e5c439e1082b714ab4c847c4c2e57dffa4971e))
- **deps:** update dependency minimatch to v5.1.0 ([#3548](https://github.com/stryker-mutator/stryker-js/issues/3548)) ([c27ec2f](https://github.com/stryker-mutator/stryker-js/commit/c27ec2f038c13ada285413ecc0a7a157afc9534c))
- **logging:** log non-existing node_modules on debug ([#3521](https://github.com/stryker-mutator/stryker-js/issues/3521)) ([766072f](https://github.com/stryker-mutator/stryker-js/commit/766072f6a6b1f92ea5973948a1a6cfd5c55be1e9))

### Features

- **plugin:** allow fileDescriptions to be injected ([#3582](https://github.com/stryker-mutator/stryker-js/issues/3582)) ([fa2b77e](https://github.com/stryker-mutator/stryker-js/commit/fa2b77e3572884f44329e3f03b9201e9fd37082c))

## [6.0.2](https://github.com/stryker-mutator/stryker-js/compare/v6.0.1...v6.0.2) (2022-05-05)

**Note:** Version bump only for package @stryker-mutator/core

## [6.0.1](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0...v6.0.1) (2022-05-04)

### Bug Fixes

- **plugin loader:** no warn when not using plugins ([#3498](https://github.com/stryker-mutator/stryker-js/issues/3498)) ([54aa298](https://github.com/stryker-mutator/stryker-js/commit/54aa298fdb1fd9a959d0cae740793727cecb80ee))

# [6.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0-beta.0...v6.0.0) (2022-05-03)

### Bug Fixes

- **core:** allow parallel schedules ([#3485](https://github.com/stryker-mutator/stryker-js/issues/3485)) ([bbbd514](https://github.com/stryker-mutator/stryker-js/commit/bbbd51424ee03a0df08c915fbfdfbacd1d733f0e))
- **html-report:** set correct background color for html report ([#3456](https://github.com/stryker-mutator/stryker-js/issues/3456)) ([a72ecf1](https://github.com/stryker-mutator/stryker-js/commit/a72ecf180f133de09c5f53c5091c586c91a522df))
- **reporter:** report progress of failed check results only once ([#3472](https://github.com/stryker-mutator/stryker-js/issues/3472)) ([dce5882](https://github.com/stryker-mutator/stryker-js/commit/dce5882f103097fe7ec9aba56b5bd7cedfb22877))
- **stryker-cli:** allow stryker-cli integration ([330ef6c](https://github.com/stryker-mutator/stryker-js/commit/330ef6c9763db5bf47d23de64a6c72073bc44bc7))

### chore

- **node:** drop support for Node 12 ([10d874e](https://github.com/stryker-mutator/stryker-js/commit/10d874e4c46335d9ea457634d3061af35fa8f854))

### Code Refactoring

- **file:** move `File` from `api` to `util` ([#3489](https://github.com/stryker-mutator/stryker-js/issues/3489)) ([ac4bcca](https://github.com/stryker-mutator/stryker-js/commit/ac4bcca133930a046e0abf28abad24a5af1dbd22))

### Features

- **config file:** accept hidden config file by default. ([#3457](https://github.com/stryker-mutator/stryker-js/issues/3457)) ([701374f](https://github.com/stryker-mutator/stryker-js/commit/701374fe11936c83bfeab4f7b67846533ad6f026))
- **mutation testing:** sort tests to improve performance ([#3467](https://github.com/stryker-mutator/stryker-js/issues/3467)) ([47344d3](https://github.com/stryker-mutator/stryker-js/commit/47344d37f26a694e95bc6745c1c66d5d7b9fe00c))
- **progress:** improve progressbar ETC estimate ([#3469](https://github.com/stryker-mutator/stryker-js/issues/3469)) ([ec63d93](https://github.com/stryker-mutator/stryker-js/commit/ec63d9397a0cf23e5fb91b9f6e3ae68ab2d3b2e0))
- **warn slow:** warn users for slow runs ([#3490](https://github.com/stryker-mutator/stryker-js/issues/3490)) ([1103958](https://github.com/stryker-mutator/stryker-js/commit/1103958c02fc32a1131c2ad6504bee892c250261))

### BREAKING CHANGES

- **file:** The `File` class is no longer part of the public api and is thus no longer exported from `@stryker-mutator/api`. Plugin creators shouldn't rely on it anymore.
- **progress:** Reporter API method `onAllMutantsMatchedWithTests` has been replaced by `onMutationTestingPlanReady`. Please use that for your reporter plugin instead.
- **progress:** Reporter API method `onAllSourceFilesRead` has been removed, please use `onMutationTestReportReady` to retrieve the source files.
- **progress:** Reporter API method `onSourceFileRead` has been removed, please use `onMutationTestReportReady` to retrieve the source files.
- **node:** Drop support for Node 12. Minimal version is now Node 14.18.0.

# [6.0.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v5.6.1...v6.0.0-beta.0) (2022-03-02)

### Features

- **checker-api:** support checking on groups of mutants ([#3450](https://github.com/stryker-mutator/stryker-js/issues/3450)) ([e9bbd39](https://github.com/stryker-mutator/stryker-js/commit/e9bbd394092aa86f2eabc857ec7feabc6d7a0b4f))
- **esm config:** support config file as pure esm ([#3432](https://github.com/stryker-mutator/stryker-js/issues/3432)) ([309a7e2](https://github.com/stryker-mutator/stryker-js/commit/309a7e2807e454a82f177de781bc4908f87c739b))
- **esm:** migrate StrykerJS to pure ESM ([#3409](https://github.com/stryker-mutator/stryker-js/issues/3409)) ([78c305e](https://github.com/stryker-mutator/stryker-js/commit/78c305e2c2271fedb54bfff3d34aa6b70b421b3a))
- **html reporter:** allow choice of `fileName`. ([#3438](https://github.com/stryker-mutator/stryker-js/issues/3438)) ([d197319](https://github.com/stryker-mutator/stryker-js/commit/d197319a21872a77b28cfef16c1087bf1bb4b9dc))
- **ignore static:** allow to ignore static mutants ([#3284](https://github.com/stryker-mutator/stryker-js/issues/3284)) ([75d9b79](https://github.com/stryker-mutator/stryker-js/commit/75d9b792e04dbafaaaff88c3994cf1a1e456610b))
- **ignore static:** prevent leak of hybrid mutants ([#3443](https://github.com/stryker-mutator/stryker-js/issues/3443)) ([231049a](https://github.com/stryker-mutator/stryker-js/commit/231049a32f73083c7579b1bf8b4424ad309f655d))
- **reload test environment:** implement test environment reload ([#3369](https://github.com/stryker-mutator/stryker-js/issues/3369)) ([b95b907](https://github.com/stryker-mutator/stryker-js/commit/b95b907e54d3a114731a8bcf659a1910df4e4f0b))
- **test runner api:** `killedBy` is always an array ([#3187](https://github.com/stryker-mutator/stryker-js/issues/3187)) ([c257966](https://github.com/stryker-mutator/stryker-js/commit/c257966e6c7726e180e072c8ae7f3fd011485c05))

### BREAKING CHANGES

- **checker-api:** The `check` method of checker plugins now receives a _group of mutants_ and should provide a `CheckResult` per mutant id.
- **html reporter:** Configuration option `htmlReporter.baseDir` is deprecated and will be removed in a later version. Please use `htmlReporter.fileName` instead.
- **esm config:** Exporting a function (using `module.exports = function(config) {}`) from your `stryker.conf.js` file is no longer supported. This was already deprecated but now will give an error.
- **esm:** StrykerJS is now a pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **esm:** Node 12.20 is now the min version.
- **esm:** Karma v6.3 is now the min supported karma version for `@stryker-mutator/karma-runner`, since [that version added support for async config loading](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23)
- **reload test environment:** Test runner plugins must provide `TestRunnerCapabilities` by implementing the `capabilities` method.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

### Bug Fixes

- **deps:** remove vulnerability by updating log4js ([#3372](https://github.com/stryker-mutator/stryker-js/issues/3372)) ([69290f2](https://github.com/stryker-mutator/stryker-js/commit/69290f287f30eee9fac96dc32bd1df2f24180b07)), closes [/github.com/log4js-node/log4js-node/blob/master/CHANGELOG.md#640](https://github.com//github.com/log4js-node/log4js-node/blob/master/CHANGELOG.md/issues/640)

# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

### Bug Fixes

- **report:** dramatically improve rendering performance of HTML report ([ad38c82](https://github.com/stryker-mutator/stryker-js/commit/ad38c8219ab5cd6dc477b67bf3416c9afdfba972))

### Features

- **clear-text reporter:** show n/a instead of NaN ([68c5c51](https://github.com/stryker-mutator/stryker-js/commit/68c5c5183c04ea2cf6b5943996972f4e411e32a9))

## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

### Bug Fixes

- **tsconfig:** rewrite "include" patterns ([#3293](https://github.com/stryker-mutator/stryker-js/issues/3293)) ([37ead22](https://github.com/stryker-mutator/stryker-js/commit/37ead22ff84925418ca7682b3e3a5d2271e7e97f)), closes [#3281](https://github.com/stryker-mutator/stryker-js/issues/3281)

# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

### Bug Fixes

- **logging:** don't log log4js category to file as well ([31609a5](https://github.com/stryker-mutator/stryker-js/commit/31609a52d255eb3f174f196f31c13f159c10f774))

### Features

- **checkers:** allow custom checker node args ([#3179](https://github.com/stryker-mutator/stryker-js/issues/3179)) ([82c4435](https://github.com/stryker-mutator/stryker-js/commit/82c4435e77b5b13aee5a4117a119b4f5dde68c2b))
- **cli:** display suggestions on error ([#3216](https://github.com/stryker-mutator/stryker-js/issues/3216)) ([9ed98e8](https://github.com/stryker-mutator/stryker-js/commit/9ed98e82e5e895ed34afb3f0247cfa29940247a0))
- **config:** Add link to docs when generating a custom config ([#3235](https://github.com/stryker-mutator/stryker-js/issues/3235)) ([7c999b8](https://github.com/stryker-mutator/stryker-js/commit/7c999b8fa5689bb7ed0e299b531add67ee101dc6))
- **html:** new diff-view when selecting mutants ([#3263](https://github.com/stryker-mutator/stryker-js/issues/3263)) ([8b253ee](https://github.com/stryker-mutator/stryker-js/commit/8b253ee8ed92d447b5f854e4250f8e1fd064cd13))
- **init:** add buildCommand question when running ([#3213](https://github.com/stryker-mutator/stryker-js/issues/3213)) ([b9d5980](https://github.com/stryker-mutator/stryker-js/commit/b9d5980fbbc69ace8acab404793418a134b2f62f))
- **jest-runner:** support `--findRelatedTests` in dry run ([#3234](https://github.com/stryker-mutator/stryker-js/issues/3234)) ([b2e4584](https://github.com/stryker-mutator/stryker-js/commit/b2e458432483353dd0ea0471b623326ff58c92bc))

## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

### Bug Fixes

- **ProgressReporter:** don't render when there are no valid mutants to render ([#3155](https://github.com/stryker-mutator/stryker-js/issues/3155)) ([41c4177](https://github.com/stryker-mutator/stryker-js/commit/41c4177cdec23a8d054e9b287618889eed3db15e))

# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

### Features

- **test runner:** Support for disable bail ([#3074](https://github.com/stryker-mutator/stryker-js/issues/3074)) ([0962232](https://github.com/stryker-mutator/stryker-js/commit/0962232fe2a181a2fde0067ed95f99885b8cee28))

# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

### Bug Fixes

- **checker:** retry on process crash ([#3059](https://github.com/stryker-mutator/stryker-js/issues/3059)) ([8880643](https://github.com/stryker-mutator/stryker-js/commit/888064313763d907d5f621103955bbc1a788afaf))
- **node 12:** clear error message for node <12.17 ([#3056](https://github.com/stryker-mutator/stryker-js/issues/3056)) ([9630fc3](https://github.com/stryker-mutator/stryker-js/commit/9630fc3d838adb2c3f47e312239b4ab37cc7b87a))

### Features

- **hit limit:** infinite loop prevention in karma-runner ([#3031](https://github.com/stryker-mutator/stryker-js/issues/3031)) ([fc732fc](https://github.com/stryker-mutator/stryker-js/commit/fc732fce8838c96be2fdf37aff69b12c996d7cb0))
- **report:** show status reason in the html report. ([d777e49](https://github.com/stryker-mutator/stryker-js/commit/d777e49639a2161abc9f9708157409163603874a))

## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

### Bug Fixes

- **karma runner:** restart a browser on disconnect error ([#3020](https://github.com/stryker-mutator/stryker-js/issues/3020)) ([fc5c449](https://github.com/stryker-mutator/stryker-js/commit/fc5c449ba329d7a8b07d47193d4916cb28d47bb1))

## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

### Bug Fixes

- **schema:** Resolve "No 'exports' main" error ([#3004](https://github.com/stryker-mutator/stryker-js/issues/3004)) ([9034806](https://github.com/stryker-mutator/stryker-js/commit/90348066bf3341a669cad67070a61f9dfd58f522))

## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

### Features

- **html:** highlight files in html report ([b7876a4](https://github.com/stryker-mutator/stryker-js/commit/b7876a4c6289e854167d2ed5b2915e16499e0651))

# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

### Bug Fixes

- **ignore patterns:** always ignore \*.tsbuildinfo files ([#2985](https://github.com/stryker-mutator/stryker-js/issues/2985)) ([794f103](https://github.com/stryker-mutator/stryker-js/commit/794f10390787d1bfa6e4a261315e4bc791790787))

## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

**Note:** Version bump only for package @stryker-mutator/core

# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

**Note:** Version bump only for package @stryker-mutator/core

## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

**Note:** Version bump only for package @stryker-mutator/core

# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)

### Bug Fixes

- **sandbox:** make directory if not exists before symlinking node_modules ([#2856](https://github.com/stryker-mutator/stryker-js/issues/2856)) ([40f9a1d](https://github.com/stryker-mutator/stryker-js/commit/40f9a1dfcc49507f28193d6049b08a246baa0ad7))

### Features

- **ignore patterns:** add "ignorePatterns" config option ([#2848](https://github.com/stryker-mutator/stryker-js/issues/2848)) ([a69992c](https://github.com/stryker-mutator/stryker-js/commit/a69992cfe5983d94e1dce0dfb367302a42001fe2)), closes [#1593](https://github.com/stryker-mutator/stryker-js/issues/1593) [#2739](https://github.com/stryker-mutator/stryker-js/issues/2739)
- **jest:** report test files and test positions ([#2808](https://github.com/stryker-mutator/stryker-js/issues/2808)) ([c19095e](https://github.com/stryker-mutator/stryker-js/commit/c19095e57f6a46d7d9c9b97f852747d4167ab256))
- **node:** Drop support for node 10 ([#2879](https://github.com/stryker-mutator/stryker-js/issues/2879)) ([dd29f88](https://github.com/stryker-mutator/stryker-js/commit/dd29f883d384fd29b86a0ef9f78808975657a001))
- **options:** make "perTest" the default for "coverageAnalysis" ([#2881](https://github.com/stryker-mutator/stryker-js/issues/2881)) ([518ebe6](https://github.com/stryker-mutator/stryker-js/commit/518ebe6b946fc35138b636a015b569fe9a272ed0))
- **range:** remove Range from the API ([#2882](https://github.com/stryker-mutator/stryker-js/issues/2882)) ([b578b22](https://github.com/stryker-mutator/stryker-js/commit/b578b22eb9ccdd023602573d5d6e52c49bf99e0f)), closes [#322](https://github.com/stryker-mutator/stryker-js/issues/322)
- **report:** add test details and metadata to JSON report ([#2755](https://github.com/stryker-mutator/stryker-js/issues/2755)) ([acb0a3a](https://github.com/stryker-mutator/stryker-js/commit/acb0a3a3ddf8e82ffbae7212538fd0bba4802944))
- **report:** report test states ([#2868](https://github.com/stryker-mutator/stryker-js/issues/2868)) ([e84aa88](https://github.com/stryker-mutator/stryker-js/commit/e84aa8849d6746ebaa22005423f6f461a67df0a9))
- **reporter api:** unify reporter api with mutation-testing-elements ([#2798](https://github.com/stryker-mutator/stryker-js/issues/2798)) ([d173b27](https://github.com/stryker-mutator/stryker-js/commit/d173b27117ade43e86a991643207532e338e7907)), closes [#2766](https://github.com/stryker-mutator/stryker-js/issues/2766)
- **serialize:** remove surrial ([#2877](https://github.com/stryker-mutator/stryker-js/issues/2877)) ([5114835](https://github.com/stryker-mutator/stryker-js/commit/51148357ed0103ebd6f60259d468bd34e535a4b3))

### BREAKING CHANGES

- **range:** The `range` property is no longer present on a `mutant`. Note, this is a breaking change for plugin creators only.

Co-authored-by: Simon de Lang <simondelang@gmail.com>

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

# [4.6.0](https://github.com/stryker-mutator/stryker-js/compare/v4.5.1...v4.6.0) (2021-04-16)

### Features

- **mutation range:** allow specifying a mutation range ([#2751](https://github.com/stryker-mutator/stryker-js/issues/2751)) ([84647cf](https://github.com/stryker-mutator/stryker-js/commit/84647cf8c4052dead95d4d23a0e9c0c66e54292c))
- **rename:** rename to StrykerJS ([#2813](https://github.com/stryker-mutator/stryker-js/issues/2813)) ([dc08592](https://github.com/stryker-mutator/stryker-js/commit/dc08592c09c0fe5fcc21db03dc2da4e03713f46b)), closes [#2754](https://github.com/stryker-mutator/stryker-js/issues/2754)

## [4.5.1](https://github.com/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)

**Note:** Version bump only for package @stryker-mutator/core

# [4.5.0](https://github.com/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)

### Bug Fixes

- **logging:** log info about symlinking on debug ([#2756](https://github.com/stryker-mutator/stryker/issues/2756)) ([c672e2e](https://github.com/stryker-mutator/stryker/commit/c672e2e0fc27817aae43839f39a166b5b1b9ba07))

### Features

- **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))
- **sandbox:** support symlinking of node_modules anywhere ([ee66623](https://github.com/stryker-mutator/stryker/commit/ee666238b29facf512126d6e056037e8ac011260))

## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

**Note:** Version bump only for package @stryker-mutator/core

# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

### Bug Fixes

- **child-process:** improve out-of-memory recognition ([#2697](https://github.com/stryker-mutator/stryker/issues/2697)) ([b97220a](https://github.com/stryker-mutator/stryker/commit/b97220a6c810b7ccc1f5fdb6e84be828a58ba1b0))

### Features

- **in place:** support in place mutation ([#2706](https://github.com/stryker-mutator/stryker/issues/2706)) ([2685a7e](https://github.com/stryker-mutator/stryker/commit/2685a7eb86c808c363aad3151f2c67f273bdf314))

## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/core

# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

### Features

- single file HTML report ([#2540](https://github.com/stryker-mutator/stryker/issues/2540)) ([057f9fd](https://github.com/stryker-mutator/stryker/commit/057f9fdf2b5468e8ea76e8be57475fd58a28b7c4))

# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

### Bug Fixes

- **CLI help:** remove non-existant logLevel 'all' ([#2626](https://github.com/stryker-mutator/stryker/issues/2626)) ([718a7f2](https://github.com/stryker-mutator/stryker/commit/718a7f2a6947f24f85dd0611e85d27a282ef3eb5))

### Features

- **debugging:** allow passing node args to the test runner ([#2609](https://github.com/stryker-mutator/stryker/issues/2609)) ([fdd95c0](https://github.com/stryker-mutator/stryker/commit/fdd95c0c6abe02201fd4ec914fc97d2cf0adf7d1))
- **resporter:** add json reporter ([#2582](https://github.com/stryker-mutator/stryker/issues/2582)) ([d18c4aa](https://github.com/stryker-mutator/stryker/commit/d18c4aaa3494931aa4b92eb277254e796d865e51))
- **timeout:** add `--dryRunTimeoutMinutes` option ([494e821](https://github.com/stryker-mutator/stryker/commit/494e8212bdc9bdebde262cf24f4cc5ca53f0fc79))

## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

**Note:** Version bump only for package @stryker-mutator/core

## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

### Bug Fixes

- **ts:** support es private fields ([#2605](https://github.com/stryker-mutator/stryker/issues/2605)) ([6bd2fbb](https://github.com/stryker-mutator/stryker/commit/6bd2fbbf0aaa5154930ce36f4d153ee91a3c5f1f))

# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

### Bug Fixes

- **concurrency:** better default for low CPU count ([#2546](https://github.com/stryker-mutator/stryker/issues/2546)) ([eac9199](https://github.com/stryker-mutator/stryker/commit/eac9199428dd1b34df756f55b9a457046b536adf))

### Features

- **angular:** update Karma config path in Angular preset ([#2548](https://github.com/stryker-mutator/stryker/issues/2548)) ([986acba](https://github.com/stryker-mutator/stryker/commit/986acba1c3aa59130b876f90e29e4925898e70a6))
- **html:** reposition stryker image ([#2593](https://github.com/stryker-mutator/stryker/issues/2593)) ([21d635a](https://github.com/stryker-mutator/stryker/commit/21d635aae0e6392cb7facd9a0974e7fc525f2fb7))
- **HTML reporter:** Dark mode support 🌑 ([#2590](https://github.com/stryker-mutator/stryker/issues/2590)) ([ca9a513](https://github.com/stryker-mutator/stryker/commit/ca9a513c3e2a95337fbca74752408c8372fe5c5d))

# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

### Bug Fixes

- **presets:** update `init` templates for 4.0 release ([#2526](https://github.com/stryker-mutator/stryker/issues/2526)) ([ec0d75e](https://github.com/stryker-mutator/stryker/commit/ec0d75e968cd2cffc662dd91ea0eee07042f0b3c))

# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

### Features

- **instrumenter:** add excludedMutations support ([#2513](https://github.com/stryker-mutator/stryker/issues/2513)) ([bfd714f](https://github.com/stryker-mutator/stryker/commit/bfd714fe1b4f9c3b2468164a95d0c5bd0cbc8fcf))

# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)

### Bug Fixes

- **config:** deprecate function based config ([#2499](https://github.com/stryker-mutator/stryker/issues/2499)) ([8ea3c18](https://github.com/stryker-mutator/stryker/commit/8ea3c18421929a0724ff99e5bf02ce0f174266cd))
- **core:** fix "too many open files" ([#2498](https://github.com/stryker-mutator/stryker/issues/2498)) ([5b7c242](https://github.com/stryker-mutator/stryker/commit/5b7c2424dc57b32d390112bcbf8b79bf41c05a11))

### Features

- **core:** add `appendPlugins` command-line option ([#2385](https://github.com/stryker-mutator/stryker/issues/2385)) ([0dec9b8](https://github.com/stryker-mutator/stryker/commit/0dec9b84b07391752af5514f90a2120c4f01d260))
- **core:** correct initial test run timing ([#2496](https://github.com/stryker-mutator/stryker/issues/2496)) ([4f5a37e](https://github.com/stryker-mutator/stryker/commit/4f5a37eb63a4e9532022821dac85d68f8939ceab))
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

# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/core

# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

### Bug Fixes

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
- **options:** deprecate old stryker options ([#2395](https://github.com/stryker-mutator/stryker/issues/2395)) ([7c637c8](https://github.com/stryker-mutator/stryker/commit/7c637c8714169a03facd42a7521f7670b7606a32))
- **reporter-api:** support mutation switching ([67f1ed5](https://github.com/stryker-mutator/stryker/commit/67f1ed52f4d17df4306362064180d267ed5445c7))

### BREAKING CHANGES

- **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.
- **reporter-api:** The `onMutantTested` and `onAllMutantsTested` methods on the `Reporter` api have changed

# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)

### Bug Fixes

- **core:** exit process on error ([#2378](https://github.com/stryker-mutator/stryker/issues/2378)) ([af18a59](https://github.com/stryker-mutator/stryker/commit/af18a590fc916d75d54bcfaf2dda1d6a90bd4df8)), closes [#2315](https://github.com/stryker-mutator/stryker/issues/2315)
- **exit prematurely:** exit when no tests were executed ([#2380](https://github.com/stryker-mutator/stryker/issues/2380)) ([6885e16](https://github.com/stryker-mutator/stryker/commit/6885e16fad7699ba93e6ebbbf0755c7d98c50c5a))

### Features

- **core:** add ability to override file headers ([#2363](https://github.com/stryker-mutator/stryker/issues/2363)) ([430d6d3](https://github.com/stryker-mutator/stryker/commit/430d6d3d17fe2ad8e2cef3b858afa7efb86c2342))
- **core:** strip comments in sandbox ([#2365](https://github.com/stryker-mutator/stryker/issues/2365)) ([55f27f2](https://github.com/stryker-mutator/stryker/commit/55f27f29b6994096c9aad038958ee93e9fa0f035)), closes [#2364](https://github.com/stryker-mutator/stryker/issues/2364)
- **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)

### BREAKING CHANGES

- **exit prematurely:** Stryker will now exit with exit code 1 when no tests were executed in the initial test run.

# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

### Features

- **command:** Support command test runner with mutation switching ([#2345](https://github.com/stryker-mutator/stryker/issues/2345)) ([59b1cfc](https://github.com/stryker-mutator/stryker/commit/59b1cfc06c4f8f5ec1e55dce4823e0f9c384b16c))
- **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))

# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/core

# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)

### Bug Fixes

- **buildCommand:** allow for a single command string in posix ([77b6a20](https://github.com/stryker-mutator/stryker/commit/77b6a209955bb71fffee61919cec6b3a14db2eff))
- **reporter:** report event order ([#2311](https://github.com/stryker-mutator/stryker/issues/2311)) ([ceb73a8](https://github.com/stryker-mutator/stryker/commit/ceb73a83dddce0df1bd1c6b9f7e7e8e75fe77e31))
- **sandbox:** exec build command before symlink ([bd25cd6](https://github.com/stryker-mutator/stryker/commit/bd25cd6ce2f28fe4b1b1b3ac792d99a9742e438b))

### Features

- **api:** add id to Mutant interface ([#2255](https://github.com/stryker-mutator/stryker/issues/2255)) ([cfc9053](https://github.com/stryker-mutator/stryker/commit/cfc90537d0b9815cba2b44b9681d171ca602766e))
- **api:** remove support for options editors ([5e56d0e](https://github.com/stryker-mutator/stryker/commit/5e56d0ea6982faf11048c8ca4bbb912ee17e88eb))
- **checker:** add checker api ([#2240](https://github.com/stryker-mutator/stryker/issues/2240)) ([d463f86](https://github.com/stryker-mutator/stryker/commit/d463f8639437c114da4fe30115652e8a470dd179)), closes [#1514](https://github.com/stryker-mutator/stryker/issues/1514) [#1980](https://github.com/stryker-mutator/stryker/issues/1980)
- **core:** add support for checker plugins ([#2285](https://github.com/stryker-mutator/stryker/issues/2285)) ([69358e1](https://github.com/stryker-mutator/stryker/commit/69358e1423701c730e29d303119a08d74081f340))
- **core:** support build command ([f71ba87](https://github.com/stryker-mutator/stryker/commit/f71ba87a7adfd85131e1dea5fb1d6f3d8bba76df))
- **instrumenter:** allow override of babel plugins ([8758cfd](https://github.com/stryker-mutator/stryker/commit/8758cfdda8ac2bfa761568f55ddee48c2a23f0e0))
- **sandbox:** add ignore header to js files ([#2291](https://github.com/stryker-mutator/stryker/issues/2291)) ([3adde83](https://github.com/stryker-mutator/stryker/commit/3adde830deb8d4b471ae6fceafd603c9750419d7)), closes [#2276](https://github.com/stryker-mutator/stryker/issues/2276)
- **tsconfig:** rewrite tsconfig references ([#2292](https://github.com/stryker-mutator/stryker/issues/2292)) ([4ee4950](https://github.com/stryker-mutator/stryker/commit/4ee4950bebd8db9c2f5a514edee57de55c040526)), closes [#2276](https://github.com/stryker-mutator/stryker/issues/2276)

### BREAKING CHANGES

- **core:** \* `--maxConcurrentTestRunners` is now deprecated. Please use `--concurrency` instead.

## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)

### Bug Fixes

- **validation:** don't warn about the commandRunner options ([2128b9a](https://github.com/stryker-mutator/stryker/commit/2128b9ad5addb5617847234be2f7f34195671661))

# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/core

## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/core

## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

### Bug Fixes

- **init:** use correct schema reference ([#2213](https://github.com/stryker-mutator/stryker/issues/2213)) ([136f538](https://github.com/stryker-mutator/stryker/commit/136f538c17140196b88ccaf80d3082546262a4e8))

## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

### Bug Fixes

- **options:** resolve false positives in unknown options warning ([#2208](https://github.com/stryker-mutator/stryker/issues/2208)) ([e3905f6](https://github.com/stryker-mutator/stryker/commit/e3905f6a4efa5aa32c4d76d09bff4692a35e78a9))

## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/core

# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)

### Features

- **api:** Deprecated Config in favor of StrykerOptions ([dccdd91](https://github.com/stryker-mutator/stryker/commit/dccdd9119743d776e2dc4b572a9e02b1524ef88b))
- **init:** add reference to mono schema ([#2162](https://github.com/stryker-mutator/stryker/issues/2162)) ([61953c7](https://github.com/stryker-mutator/stryker/commit/61953c703631619b51442298e1cff8532c336d4a))
- **validation:** validate StrykerOptions using JSON schema ([5f05665](https://github.com/stryker-mutator/stryker/commit/5f0566581abdd1229dfe5d27a25a676bec93d8f8))
- **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))
- **validation:** hide stacktrace on validation error ([8c5ee88](https://github.com/stryker-mutator/stryker/commit/8c5ee889c7b06569bbfeb6a9557b8cecda16f0eb))
- **validation:** warn about unknown stryker config options ([#2164](https://github.com/stryker-mutator/stryker/issues/2164)) ([8c6fd97](https://github.com/stryker-mutator/stryker/commit/8c6fd972dc57e246d361132dc176920d380c91cc)), closes [#2103](https://github.com/stryker-mutator/stryker/issues/2103)

# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

### Bug Fixes

- **api:** allow for different api versions of File ([#2124](https://github.com/stryker-mutator/stryker/issues/2124)) ([589de85](https://github.com/stryker-mutator/stryker/commit/589de85361297999c8b5625e800783a18e6507e5))

## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

### Bug Fixes

- **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))

## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

**Note:** Version bump only for package @stryker-mutator/core

# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)

### Bug Fixes

- **api:** allow for different api versions of File ([#2042](https://github.com/stryker-mutator/stryker/issues/2042)) ([9d1fcc1](https://github.com/stryker-mutator/stryker/commit/9d1fcc17e3e8125d8aa9174e3092d4f9913cc656)), closes [#2025](https://github.com/stryker-mutator/stryker/issues/2025)
- **mocha:** support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)

### Features

- **config:** Allow a `stryker.conf.json` as default config file. ([#2092](https://github.com/stryker-mutator/stryker/issues/2092)) ([2279813](https://github.com/stryker-mutator/stryker/commit/2279813dec4f9fabbfe9dcd521dc2e19d5902dc6))
- **core:** exit code 1 when error in initial run ([49c5162](https://github.com/stryker-mutator/stryker/commit/49c5162461b5240a6c4204305cb21a7dd74d5172))
- **excludedMutations:** remove deprecated mutation names ([#2027](https://github.com/stryker-mutator/stryker/issues/2027)) ([6f7bfe1](https://github.com/stryker-mutator/stryker/commit/6f7bfe13e8ec681d73c97d9b7fbd3f88a313ed6d))
- **HtmlReporter:** include the html reporter in the core package and add it to the default reporters ([#2036](https://github.com/stryker-mutator/stryker/issues/2036)) ([09702d9](https://github.com/stryker-mutator/stryker/commit/09702d9a05387f407d8fc43d21db38b3a14cbec7)), closes [#1919](https://github.com/stryker-mutator/stryker/issues/1919)
- **Initializer:** Initialize config file as JSON by default ([#2093](https://github.com/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.com/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.com/stryker-mutator/stryker/issues/2000)
- **promisified fs:** use node 10 promisified functions ([#2028](https://github.com/stryker-mutator/stryker/issues/2028)) ([1c57d8f](https://github.com/stryker-mutator/stryker/commit/1c57d8f4620c2392e167f45fa20aa6acbd0c7a7d))
- **react:** change react to create-react-app ([#1978](https://github.com/stryker-mutator/stryker/issues/1978)) ([7f34f28](https://github.com/stryker-mutator/stryker/commit/7f34f28dda821da561ae7ea5d041bb58fca4c011))
- **Reporter.onScoreCalculated:** remove deprecated onScoreCalculatedevent ([#2026](https://github.com/stryker-mutator/stryker/issues/2026)) ([9fa4175](https://github.com/stryker-mutator/stryker/commit/9fa41757d7bed58c98bc3fbd0c8c861670fbd025))

### BREAKING CHANGES

- **core:** Stryker now exists with exitCode `1` if an error of any kind occurs.
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

## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/core

# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

### Bug Fixes

- edge cases, duplication, log output ([#1720](https://github.com/stryker-mutator/stryker/issues/1720)) ([7f42d34](https://github.com/stryker-mutator/stryker/commit/7f42d34))
- **tempDir:** don't resolve temp dir as input file ([#1710](https://github.com/stryker-mutator/stryker/issues/1710)) ([bbdd02a](https://github.com/stryker-mutator/stryker/commit/bbdd02a))

### Features

- **javascript-mutator:** allow to override babel plugins ([#1764](https://github.com/stryker-mutator/stryker/issues/1764)) ([ddb3d60](https://github.com/stryker-mutator/stryker/commit/ddb3d60))
- **mutant-matcher:** lower memory usage ([#1794](https://github.com/stryker-mutator/stryker/issues/1794)) ([16294e5](https://github.com/stryker-mutator/stryker/commit/16294e5))
- **progress-reporter:** show timed out mutant count ([#1818](https://github.com/stryker-mutator/stryker/issues/1818)) ([067df6d](https://github.com/stryker-mutator/stryker/commit/067df6d))
- **stryker:** remind user to add `.stryker-temp` to gitignore ([#1722](https://github.com/stryker-mutator/stryker/issues/1722)) ([596e1ee](https://github.com/stryker-mutator/stryker/commit/596e1ee))

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

- **inquirer:** fix inquirer types ([#1563](https://github.com/stryker-mutator/stryker/issues/1563)) ([37ca23c](https://github.com/stryker-mutator/stryker/commit/37ca23c))

# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)

### Features

- **deps:** update source-map dep to current major release ([45fa0f8](https://github.com/stryker-mutator/stryker/commit/45fa0f8))
- **formatting:** remove dependency on prettier ([#1552](https://github.com/stryker-mutator/stryker/issues/1552)) ([24543d3](https://github.com/stryker-mutator/stryker/commit/24543d3)), closes [#1261](https://github.com/stryker-mutator/stryker/issues/1261)
- **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))

### BREAKING CHANGES

- **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.

## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

### Bug Fixes

- **clean up:** prevent sandbox creation after dispose ([#1527](https://github.com/stryker-mutator/stryker/issues/1527)) ([73fc0a8](https://github.com/stryker-mutator/stryker/commit/73fc0a8))

# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

### Bug Fixes

- **dispose:** clean up child processes in alternative flows ([#1520](https://github.com/stryker-mutator/stryker/issues/1520)) ([31ee085](https://github.com/stryker-mutator/stryker/commit/31ee085))

# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

### Features

- **reporter:** implement `mutationTestReport` ([16ba76b](https://github.com/stryker-mutator/stryker/commit/16ba76b))

## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

### Bug Fixes

- **broadcast-reporter:** log error detail ([#1461](https://github.com/stryker-mutator/stryker/issues/1461)) ([2331847](https://github.com/stryker-mutator/stryker/commit/2331847))

# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

### Bug Fixes

- **presets:** install v1.x dependencies instead of v0.x ([#1434](https://github.com/stryker-mutator/stryker/issues/1434)) ([7edda46](https://github.com/stryker-mutator/stryker/commit/7edda46))

## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/core

## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)

### Bug Fixes

- **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)

## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/core

## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.35.1...@stryker-mutator/core@1.0.0) (2019-02-13)

### Features

- **config injection:** remove Config from the DI tokens ([#1389](https://github.com/stryker-mutator/stryker/issues/1389)) ([857e4a5](https://github.com/stryker-mutator/stryker/commit/857e4a5))
- **ES5 support:** remove ES5 mutator ([#1370](https://github.com/stryker-mutator/stryker/issues/1370)) ([cb585b4](https://github.com/stryker-mutator/stryker/commit/cb585b4))
- **factories:** remove deprecated factories ([#1381](https://github.com/stryker-mutator/stryker/issues/1381)) ([df2fcdf](https://github.com/stryker-mutator/stryker/commit/df2fcdf))
- **getLogger:** remove getLogger and LoggerFactory from the API ([#1385](https://github.com/stryker-mutator/stryker/issues/1385)) ([cb14e67](https://github.com/stryker-mutator/stryker/commit/cb14e67))
- **InputFileResolver:** remove InputFileDescriptor support ([#1390](https://github.com/stryker-mutator/stryker/issues/1390)) ([7598bc0](https://github.com/stryker-mutator/stryker/commit/7598bc0))
- **port:** remove port config key ([#1386](https://github.com/stryker-mutator/stryker/issues/1386)) ([9c65aa2](https://github.com/stryker-mutator/stryker/commit/9c65aa2))
- **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))
- **reporter config:** remove deprecated reporter config option ([#1371](https://github.com/stryker-mutator/stryker/issues/1371)) ([2034a67](https://github.com/stryker-mutator/stryker/commit/2034a67))
- **timeoutMS:** remove deprecated timeoutMs property ([#1382](https://github.com/stryker-mutator/stryker/issues/1382)) ([8d5f682](https://github.com/stryker-mutator/stryker/commit/8d5f682))

### BREAKING CHANGES

- **rename:** The core package and plugins have been renamed: stryker -> @stryker-mutator/core
- **config injection:** Remove Config object from Dependency Injection (only relevant for plugin creators).
- **getLogger:** Remove `getLogger` and `LoggerFactory` from the API. Please use dependency injection to inject a logger. See https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md#plugins for more detail
- **port:** Remove the port config key. Ports should be automatically selected.
- **InputFileResolver:** Remove InputFileDescriptor support. Entries of the `files` and `mutate` array should only contain strings, not objects. The `files` array can be removed in most cases as it can be generated using Git.
- **factories:** Remove the Factory (and children) from the stryker-api package. Use DI to ensure classes are created. For more information, see https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md#dependency-injection
- **reporter config:** Remove the 'reporter' config option. Please use the 'reporters' (plural) config option instead.
- **ES5 support:** Remove the ES5 mutator. The 'javascript' mutator is now the default mutator. Users without a mutator plugin should install `@stryker-mutator/javascript-mutator`.
- **timeoutMS:** Remove the 'timeoutMs' config option. Please use the 'timeoutMS' config option instead.

## [0.35.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.35.0...stryker@0.35.1) (2019-02-12)

### Bug Fixes

- **mutants:** Prevent memory leak when transpiling mutants ([#1376](https://github.com/stryker-mutator/stryker/issues/1376)) ([45c2852](https://github.com/stryker-mutator/stryker/commit/45c2852)), closes [#920](https://github.com/stryker-mutator/stryker/issues/920)

# [0.35.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.34.0...stryker@0.35.0) (2019-02-08)

### Bug Fixes

- **stryker:** Add logging on debug level for transpile errors ([7063216](https://github.com/stryker-mutator/stryker/commit/7063216))

### Features

- **config-editors:** Remove side effects from all config editor plugins ([#1317](https://github.com/stryker-mutator/stryker/issues/1317)) ([1f61bed](https://github.com/stryker-mutator/stryker/commit/1f61bed))
- **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
- **html-reporter:** Remove side effects from html reporter ([#1314](https://github.com/stryker-mutator/stryker/issues/1314)) ([66d65f7](https://github.com/stryker-mutator/stryker/commit/66d65f7))
- **mutators:** Remove side effects from mutator plugins ([#1352](https://github.com/stryker-mutator/stryker/issues/1352)) ([edaf401](https://github.com/stryker-mutator/stryker/commit/edaf401))
- **port:** Deprecate property 'port' ([#1309](https://github.com/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.com/stryker-mutator/stryker/commit/2539ee0))
- **test-frameworks:** Remove side effects from all test-framework plugins ([#1319](https://github.com/stryker-mutator/stryker/issues/1319)) ([a7160f4](https://github.com/stryker-mutator/stryker/commit/a7160f4))
- **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))
- **transpilers:** Remove side effects transpiler plugins ([#1351](https://github.com/stryker-mutator/stryker/issues/1351)) ([9a8b539](https://github.com/stryker-mutator/stryker/commit/9a8b539))

<a name="0.34.0"></a>

# [0.34.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.33.2...stryker@0.34.0) (2018-12-23)

### Features

- **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))
- **zero config:** Support mutation testing without any configuration ([#1264](https://github.com/stryker-mutator/stryker/issues/1264)) ([fe8f696](https://github.com/stryker-mutator/stryker/commit/fe8f696))

<a name="0.33.2"></a>

## [0.33.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.33.1...stryker@0.33.2) (2018-12-12)

**Note:** Version bump only for package stryker

<a name="0.33.1"></a>

## [0.33.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.33.0...stryker@0.33.1) (2018-11-29)

### Bug Fixes

- **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))

<a name="0.33.0"></a>

# [0.33.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.32.1...stryker@0.33.0) (2018-11-29)

### Bug Fixes

- **JestTestRunner:** run jest with --findRelatedTests ([#1235](https://github.com/stryker-mutator/stryker/issues/1235)) ([5e0790e](https://github.com/stryker-mutator/stryker/commit/5e0790e))

### Features

- **console-colors:** Add a global config option to enable/disable colors in console ([#1251](https://github.com/stryker-mutator/stryker/issues/1251)) ([19b1d64](https://github.com/stryker-mutator/stryker/commit/19b1d64))
- **Stryker CLI 'init':** Support for preset configuration during 'stryker init' ([#1248](https://github.com/stryker-mutator/stryker/issues/1248)) ([5673e6b](https://github.com/stryker-mutator/stryker/commit/5673e6b))

<a name="0.32.1"></a>

## [0.32.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.32.0...stryker@0.32.1) (2018-11-21)

### Bug Fixes

- **log4js:** Don't log log4js category to console ([#1246](https://github.com/stryker-mutator/stryker/issues/1246)) ([479d999](https://github.com/stryker-mutator/stryker/commit/479d999))

<a name="0.32.0"></a>

# [0.32.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.31.0...stryker@0.32.0) (2018-11-13)

### Features

- **error debugging:** add remark to run again with loglevel trace ([#1231](https://github.com/stryker-mutator/stryker/issues/1231)) ([c9e3d97](https://github.com/stryker-mutator/stryker/commit/c9e3d97)), closes [#1205](https://github.com/stryker-mutator/stryker/issues/1205)

<a name="0.31.0"></a>

# [0.31.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.30.1...stryker@0.31.0) (2018-11-07)

### Features

- **clear text reporter:** Prettify the clear-text report ([#1185](https://github.com/stryker-mutator/stryker/issues/1185)) ([a49829b](https://github.com/stryker-mutator/stryker/commit/a49829b))

<a name="0.30.1"></a>

## [0.30.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.30.0...stryker@0.30.1) (2018-10-25)

### Bug Fixes

- **file resolving:** ignore dirs from git submodules ([#1195](https://github.com/stryker-mutator/stryker/issues/1195)) ([7806083](https://github.com/stryker-mutator/stryker/commit/7806083))

<a name="0.30.0"></a>

# [0.30.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.5...stryker@0.30.0) (2018-10-15)

### Bug Fixes

- **any-promise:** Don't register a promise implementation ([#1180](https://github.com/stryker-mutator/stryker/issues/1180)) ([1d3e2f6](https://github.com/stryker-mutator/stryker/commit/1d3e2f6))

### Features

- **ProgressReporter:** Format estimated time of completion (ETC) ([#1176](https://github.com/stryker-mutator/stryker/issues/1176)) ([4e76b46](https://github.com/stryker-mutator/stryker/commit/4e76b46))

<a name="0.29.5"></a>

## [0.29.5](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.4...stryker@0.29.5) (2018-10-03)

**Note:** Version bump only for package stryker

<a name="0.29.4"></a>

## [0.29.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.3...stryker@0.29.4) (2018-10-02)

### Bug Fixes

- **ScoreResultCalculator:** fix faulty filenames in stryker score result ([#1165](https://github.com/stryker-mutator/stryker/issues/1165)) ([2555f49](https://github.com/stryker-mutator/stryker/commit/2555f49)), closes [#1140](https://github.com/stryker-mutator/stryker/issues/1140)

<a name="0.29.3"></a>

## [0.29.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.2...stryker@0.29.3) (2018-09-30)

### Bug Fixes

- **karma-runner:** improve error message ([#1145](https://github.com/stryker-mutator/stryker/issues/1145)) ([2e56d38](https://github.com/stryker-mutator/stryker/commit/2e56d38))

<a name="0.29.2"></a>

## [0.29.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.1...stryker@0.29.2) (2018-09-14)

**Note:** Version bump only for package stryker

<a name="0.29.1"></a>

## [0.29.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.29.0...stryker@0.29.1) (2018-08-28)

**Note:** Version bump only for package stryker

<a name="0.29.0"></a>

# [0.29.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.28.0...stryker@0.29.0) (2018-08-21)

### Features

- **stryker config:** rename config setting `timeoutMs` to `timeoutMS` ([#1099](https://github.com/stryker-mutator/stryker/issues/1099)) ([3ded998](https://github.com/stryker-mutator/stryker/commit/3ded998)), closes [#860](https://github.com/stryker-mutator/stryker/issues/860)

<a name="0.28.0"></a>

# [0.28.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.27.1...stryker@0.28.0) (2018-08-19)

### Features

- **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)

<a name="0.27.1"></a>

## [0.27.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.27.0...stryker@0.27.1) (2018-08-17)

### Bug Fixes

- **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))

<a name="0.27.0"></a>

# [0.27.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.26.2...stryker@0.27.0) (2018-08-17)

### Features

- **Command test runner:** Add command test runner ([#1047](https://github.com/stryker-mutator/stryker/issues/1047)) ([ee919fb](https://github.com/stryker-mutator/stryker/commit/ee919fb)), closes [#768](https://github.com/stryker-mutator/stryker/issues/768)

<a name="0.26.2"></a>

## [0.26.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.26.1...stryker@0.26.2) (2018-08-16)

**Note:** Version bump only for package stryker

<a name="0.26.1"></a>

## [0.26.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.26.0...stryker@0.26.1) (2018-08-03)

### Bug Fixes

- **stryker:** Clear timeouts so stryker exits correctly ([#1063](https://github.com/stryker-mutator/stryker/issues/1063)) ([2058382](https://github.com/stryker-mutator/stryker/commit/2058382))

<a name="0.26.0"></a>

# [0.26.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.25.1...stryker@0.26.0) (2018-08-03)

### Features

- **child process:** Make all child processes silent ([#1039](https://github.com/stryker-mutator/stryker/issues/1039)) ([80b044a](https://github.com/stryker-mutator/stryker/commit/80b044a)), closes [#1038](https://github.com/stryker-mutator/stryker/issues/1038) [#976](https://github.com/stryker-mutator/stryker/issues/976)

<a name="0.25.1"></a>

## [0.25.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.25.0...stryker@0.25.1) (2018-07-23)

### Bug Fixes

- **Test runner:** Don't crash on first failure ([#1037](https://github.com/stryker-mutator/stryker/issues/1037)) ([94790c3](https://github.com/stryker-mutator/stryker/commit/94790c3))

<a name="0.25.0"></a>

# [0.25.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.24.2...stryker@0.25.0) (2018-07-20)

### Bug Fixes

- **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)
- **stryker:** log runtime error messages on debug ([#1030](https://github.com/stryker-mutator/stryker/issues/1030)) ([27fc6de](https://github.com/stryker-mutator/stryker/commit/27fc6de)), closes [#977](https://github.com/stryker-mutator/stryker/issues/977)

### Features

- **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)
- **stryker init:** Add support for yarn installs to `stryker init` ([#962](https://github.com/stryker-mutator/stryker/issues/962)) ([5aca197](https://github.com/stryker-mutator/stryker/commit/5aca197))

<a name="0.24.2"></a>

## [0.24.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.24.1...stryker@0.24.2) (2018-07-04)

### Bug Fixes

- **stryker:** kill entire test process tree ([#927](https://github.com/stryker-mutator/stryker/issues/927)) ([71af3e3](https://github.com/stryker-mutator/stryker/commit/71af3e3))

<a name="0.24.1"></a>

## [0.24.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.24.0...stryker@0.24.1) (2018-05-31)

### Bug Fixes

- **Peer dep:** set correct stryker-api peer dependency ([#830](https://github.com/stryker-mutator/stryker/issues/830)) ([af973a1](https://github.com/stryker-mutator/stryker/commit/af973a1))

<a name="0.24.0"></a>

# [0.24.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.23.0...stryker@0.24.0) (2018-05-21)

### Features

- **Dashboard reporter:** add support for CircleCI ([a58afff](https://github.com/stryker-mutator/stryker/commit/a58afff))

<a name="0.23.0"></a>

# [0.23.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.4...stryker@0.23.0) (2018-04-30)

### Features

- **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))

### BREAKING CHANGES

- **node version:** Node 4 is no longer supported.

<a name="0.22.4"></a>

## [0.22.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.3...stryker@0.22.4) (2018-04-20)

### Bug Fixes

- **Sandbox:** make sure .stryker-tmp does not appear in the sandbox ([#716](https://github.com/stryker-mutator/stryker/issues/716)) ([48acc2c](https://github.com/stryker-mutator/stryker/commit/48acc2c)), closes [#698](https://github.com/stryker-mutator/stryker/issues/698)

<a name="0.22.3"></a>

## [0.22.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.2...stryker@0.22.3) (2018-04-20)

### Bug Fixes

- **Sandbox pool:** remove race condition ([#714](https://github.com/stryker-mutator/stryker/issues/714)) ([a3606d8](https://github.com/stryker-mutator/stryker/commit/a3606d8)), closes [#713](https://github.com/stryker-mutator/stryker/issues/713)

<a name="0.22.2"></a>

## [0.22.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.1...stryker@0.22.2) (2018-04-20)

**Note:** Version bump only for package stryker

<a name="0.22.1"></a>

## [0.22.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.0...stryker@0.22.1) (2018-04-13)

### Bug Fixes

- **Dependencies:** set correct stryker-api dependency ([#694](https://github.com/stryker-mutator/stryker/issues/694)) ([e333fd9](https://github.com/stryker-mutator/stryker/commit/e333fd9))

<a name="0.22.0"></a>

# [0.22.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.21.1...stryker@0.22.0) (2018-04-11)

### Features

- **Sandbox isolation:** symbolic link node_modules in sandboxes ([#689](https://github.com/stryker-mutator/stryker/issues/689)) ([487ab7c](https://github.com/stryker-mutator/stryker/commit/487ab7c))

<a name="0.21.1"></a>

## [0.21.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.21.0...stryker@0.21.1) (2018-04-09)

### Bug Fixes

- **Dashboard reporter:** fix typos ([047a370](https://github.com/stryker-mutator/stryker/commit/047a370))

<a name="0.21.0"></a>

# [0.21.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.20.1...stryker@0.21.0) (2018-04-04)

### Bug Fixes

- **Progress reporter:** don't prevent stryker from closing ([21255aa](https://github.com/stryker-mutator/stryker/commit/21255aa))

### Features

- **identify-files:** use git to list files in `InputFileResolver` ([df6169a](https://github.com/stryker-mutator/stryker/commit/df6169a))

### BREAKING CHANGES

- **identify-files:** \* The `InputFileDescriptor` syntax for files is no longer supported.
- Test runner plugins should keep track of which files are included
  into a test run and in which order.
- Transpiler plugins should keep track of which files are to be
  transpiled.

<a name="0.20.1"></a>

## [0.20.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.20.0...stryker@0.20.1) (2018-03-22)

### Bug Fixes

- **peerDependency:** update stryker-api requirement to ^0.14.0 ([3ce04d4](https://github.com/stryker-mutator/stryker/commit/3ce04d4))

<a name="0.20.0"></a>

# [0.20.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.4...stryker@0.20.0) (2018-03-22)

### Features

- **stryker:** add excludedMutations as a config option ([#13](https://github.com/stryker-mutator/stryker/issues/13)) ([#652](https://github.com/stryker-mutator/stryker/issues/652)) ([cc8a5f1](https://github.com/stryker-mutator/stryker/commit/cc8a5f1))

<a name="0.19.4"></a>

## [0.19.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.3...stryker@0.19.4) (2018-03-21)

**Note:** Version bump only for package stryker

<a name="0.19.3"></a>

## [0.19.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.2...stryker@0.19.3) (2018-02-14)

### Bug Fixes

- **coverage-analysis:** make sure to not erase sourceMappingURL comment ([#625](https://github.com/stryker-mutator/stryker/issues/625)) ([eed7147](https://github.com/stryker-mutator/stryker/commit/eed7147))

<a name="0.19.2"></a>

## [0.19.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.1...stryker@0.19.2) (2018-02-08)

### Bug Fixes

- **stryker:** remove import to undependant module ([0956194](https://github.com/stryker-mutator/stryker/commit/0956194))

<a name="0.19.1"></a>

## [0.19.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.0...stryker@0.19.1) (2018-02-07)

### Bug Fixes

- **dependencies:** update stryker-api requirement to ^0.13.0 ([8eba6d4](https://github.com/stryker-mutator/stryker/commit/8eba6d4))

<a name="0.19.0"></a>

# [0.19.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.2...stryker@0.19.0) (2018-02-07)

### Features

- **coverage analysis:** Support transpiled code ([#559](https://github.com/stryker-mutator/stryker/issues/559)) ([7c351ad](https://github.com/stryker-mutator/stryker/commit/7c351ad))
- **dashboard-reporter:** Add dashboard reporter ([#472](https://github.com/stryker-mutator/stryker/issues/472)) ([0693a41](https://github.com/stryker-mutator/stryker/commit/0693a41))

<a name="0.18.2"></a>

## [0.18.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.1...stryker@0.18.2) (2018-02-02)

**Note:** Version bump only for package stryker

<a name="0.18.1"></a>

## [0.18.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.0...stryker@0.18.1) (2018-01-19)

**Note:** Version bump only for package stryker

<a name="0.18.0"></a>

# [0.18.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.2...stryker@0.18.0) (2018-01-12)

### Features

- **Child processes:** Support process message polution ([#572](https://github.com/stryker-mutator/stryker/issues/572)) ([dbe4d84](https://github.com/stryker-mutator/stryker/commit/dbe4d84))

<a name="0.17.2"></a>

## [0.17.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.1...stryker@0.17.2) (2018-01-10)

### Bug Fixes

- **es5-mutator:** Describe migration for users with plugins ([6be95c3](https://github.com/stryker-mutator/stryker/commit/6be95c3))

<a name="0.17.1"></a>

## [0.17.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.0...stryker@0.17.1) (2018-01-10)

**Note:** Version bump only for package stryker

<a name="0.17.0"></a>

# [0.17.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.16.0...stryker@0.17.0) (2017-12-21)

### Features

- **cvg analysis:** New coverage instrumenter ([#550](https://github.com/stryker-mutator/stryker/issues/550)) ([2bef577](https://github.com/stryker-mutator/stryker/commit/2bef577))

<a name="0.16.0"></a>

# [0.16.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.6...stryker@0.16.0) (2017-12-19)

### Features

- **config:** [#438](https://github.com/stryker-mutator/stryker/issues/438) Extensive config validation ([#549](https://github.com/stryker-mutator/stryker/issues/549)) ([dc6fdf2](https://github.com/stryker-mutator/stryker/commit/dc6fdf2))

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

- **StrykerSpec:** Uncomment tests ([#471](https://github.com/stryker-mutator/stryker/issues/471)) ([4a13afa](https://github.com/stryker-mutator/stryker/commit/4a13afa))

<a name="0.15.1"></a>

## [0.15.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.0...stryker@0.15.1) (2017-11-24)

### Bug Fixes

- **Initializer:** Remove es5 option ([#469](https://github.com/stryker-mutator/stryker/issues/469)) ([98048f4](https://github.com/stryker-mutator/stryker/commit/98048f4))

<a name="0.15.0"></a>

# [0.15.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.14.1...stryker@0.15.0) (2017-11-24)

### Features

- **JavaScript mutator:** Add stryker-javascript-mutator package ([#467](https://github.com/stryker-mutator/stryker/issues/467)) ([06d6bac](https://github.com/stryker-mutator/stryker/commit/06d6bac)), closes [#429](https://github.com/stryker-mutator/stryker/issues/429)

<a name="0.14.1"></a>

## [0.14.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.14.0...stryker@0.14.1) (2017-11-17)

**Note:** Version bump only for package stryker

<a name="0.14.0"></a>

# [0.14.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.13.0...stryker@0.14.0) (2017-11-13)

### Bug Fixes

- **InputFileResolver:** Presume .zip and .tar are binary files. ([#452](https://github.com/stryker-mutator/stryker/issues/452)) ([94f8fdc](https://github.com/stryker-mutator/stryker/commit/94f8fdc)), closes [#447](https://github.com/stryker-mutator/stryker/issues/447)

### Features

- **mocha 4:** Add support for mocha version 4 ([#455](https://github.com/stryker-mutator/stryker/issues/455)) ([de6ae4f](https://github.com/stryker-mutator/stryker/commit/de6ae4f))

<a name="0.13.0"></a>

# [0.13.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.12.0...stryker@0.13.0) (2017-10-24)

### Features

- **default score:** Set default score to 100 ([b9231fe](https://github.com/stryker-mutator/stryker/commit/b9231fe))
- **transpiler api:** Async transpiler plugin support ([#433](https://github.com/stryker-mutator/stryker/issues/433)) ([794e587](https://github.com/stryker-mutator/stryker/commit/794e587))

<a name="0.12.0"></a>

## [0.12.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.2...stryker@0.12.0) (2017-10-20)

### Bug Fixes

- **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)

### BREAKING CHANGES

- **mocha framework:** \* Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.

<a name="0.11.2"></a>

## [0.11.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.1...stryker@0.11.2) (2017-10-11)

### Bug Fixes

- **deps:** Remove types for prettier as a dev ([7014322](https://github.com/stryker-mutator/stryker/commit/7014322))

<a name="0.11.1"></a>

## [0.11.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.0...stryker@0.11.1) (2017-10-10)

**Note:** Version bump only for package stryker

<a name="0.11.0"></a>

# [0.11.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.3...stryker@0.11.0) (2017-10-03)

### Bug Fixes

- **progress reporter:** Simpify reported progress ([#401](https://github.com/stryker-mutator/stryker/issues/401)) ([6258ef1](https://github.com/stryker-mutator/stryker/commit/6258ef1)), closes [#400](https://github.com/stryker-mutator/stryker/issues/400)
- **sandbox:** Prevent hanging child processes ([#402](https://github.com/stryker-mutator/stryker/issues/402)) ([ff6962a](https://github.com/stryker-mutator/stryker/commit/ff6962a)), closes [#396](https://github.com/stryker-mutator/stryker/issues/396)

### Features

- **ConfigReader:** Use CLI options with default config file ([#404](https://github.com/stryker-mutator/stryker/issues/404)) ([99cdc61](https://github.com/stryker-mutator/stryker/commit/99cdc61)), closes [#390](https://github.com/stryker-mutator/stryker/issues/390)
- **StrykerInitializer:** Add the option to select mutators and transpilers ([#403](https://github.com/stryker-mutator/stryker/issues/403)) ([c61786f](https://github.com/stryker-mutator/stryker/commit/c61786f))

<a name="0.10.3"></a>

## [0.10.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.2...stryker@0.10.3) (2017-09-22)

**Note:** Version bump only for package stryker

<a name="0.10.2"></a>

# [0.10.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.1...stryker@0.10.2) (2017-09-20)

### Bug Fixes

- **dependency on 'rx':** Remove requires to `'rx'` directly ([71f7330](https://github.com/stryker-mutator/stryker/commit/71f7330))
- **missing dependency:** Remove invalid package-lock file ([aeeeb7b](https://github.com/stryker-mutator/stryker/commit/aeeeb7b))
- **MutationTestExecutor:** Only complete defined observables ([#381](https://github.com/stryker-mutator/stryker/issues/381)) ([a0a1355](https://github.com/stryker-mutator/stryker/commit/a0a1355))

<a name="0.10.1"></a>

# [0.10.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.3...stryker@0.10.1) (2017-09-20)

### Bug Fixes

- **missing dependency:** Remove invalid package-lock file ([aeeeb7b](https://github.com/stryker-mutator/stryker/commit/aeeeb7b))

<a name="0.10.0"></a>

# [0.10.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.3...stryker@0.10.0) (2017-09-19)

### Features

- **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))

### BREAKING CHANGES

- **typescript:** \* Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
- Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`.

<a name="0.9.3"></a>

## [0.9.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.2...stryker@0.9.3) (2017-09-09)

### Bug Fixes

- **score-result:** Wrap single file reports ([#379](https://github.com/stryker-mutator/stryker/issues/379)) ([986eb6b](https://github.com/stryker-mutator/stryker/commit/986eb6b))

<a name="0.9.2"></a>

## [0.9.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.1...stryker@0.9.2) (2017-09-06)

### Bug Fixes

- **init command:** indent "stryker.conf.js" file after "stryker init" ([52ac439](https://github.com/stryker-mutator/stryker/commit/52ac439))

<a name="0.9.1"></a>

## [0.9.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.0...stryker@0.9.1) (2017-09-04)

### Bug Fixes

- **stryker-init:** Stryker init won't create temp folder ([#361](https://github.com/stryker-mutator/stryker/issues/361)) ([a4333c9](https://github.com/stryker-mutator/stryker/commit/a4333c9))

<a name="0.9.0"></a>

# [0.9.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.8.0...stryker@0.9.0) (2017-08-25)

### Bug Fixes

- **MochaTestRunner:** Exit with a warning if no tests were executed (#360) ([ac52860](https://github.com/stryker-mutator/stryker/commit/ac52860))

### Code Refactoring

- change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))

### BREAKING CHANGES

- Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.

<a name="0.8.0"></a>

# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.7.0...stryker@0.8.0) (2017-08-11)

### Features

- **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)
- **IsolatedTestRunner:** Handle promise rejections (#351) ([f596993](https://github.com/stryker-mutator/stryker/commit/f596993))

<a name="0.7.0"></a>

# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.7...stryker@0.7.0) (2017-08-04)

### Features

- **ConfigReader:** Inform about init command (#340) ([7f3e61f](https://github.com/stryker-mutator/stryker/commit/7f3e61f))
- **html-reporter:** Score result as single source of truth (#341) ([47b3295](https://github.com/stryker-mutator/stryker/commit/47b3295)), closes [#335](https://github.com/stryker-mutator/stryker/issues/335)

<a name="0.6.7"></a>

## [0.6.7](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.6...stryker@0.6.7) (2017-07-14)

### Bug Fixes

- **ts-2.4:** Fix type issues for typescript 2.4 (#337) ([c18079b](https://github.com/stryker-mutator/stryker/commit/c18079b)), closes [#337](https://github.com/stryker-mutator/stryker/issues/337)

<a name="0.6.6"></a>

## [0.6.6](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.4...stryker@0.6.6) (2017-06-16)

### Bug Fixes

- **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))
- Manual version bump ([a67d90b](https://github.com/stryker-mutator/stryker/commit/a67d90b))

<a name="0.6.3"></a>

## [0.6.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.2...stryker@0.6.3) (2017-06-08)

### Bug Fixes

- **intializer:** Remove install of `stryker` itself (#317) ([8b8dd30](https://github.com/stryker-mutator/stryker/commit/8b8dd30)), closes [#316](https://github.com/stryker-mutator/stryker/issues/316)
- **MethodChainMutatorSpec:** Fix test name, so it matches the name of the mutator. (#313) ([5e53982](https://github.com/stryker-mutator/stryker/commit/5e53982)), closes [#313](https://github.com/stryker-mutator/stryker/issues/313)

<a name="0.6.3"></a>

## 0.6.3 (2017-06-02)

### Features

- **Mutators:** Add Boolean substitution mutators (#294) ([a137a97](https://github.com/stryker-mutator/stryker/commit/a137a97))
- **report-score-result:** Report score result as tree (#309) ([965c575](https://github.com/stryker-mutator/stryker/commit/965c575))

<a name="0.6.0"></a>

# 0.6.0 (2017-04-21)

### Bug Fixes

- **IsolatedTestRunnerAdapter:** Don't kill processes using SIGKILL (#270) ([f606e9d](https://github.com/stryker-mutator/stryker/commit/f606e9d))
- **IsolatedTestRunnerAdapter:** Improve error handling when test runner worker process crashes (#285) ([2b4bda7](https://github.com/stryker-mutator/stryker/commit/2b4bda7))

### Features

- **multi-package:** Migrate to multi-package repo (#257) ([0c2fde5](https://github.com/stryker-mutator/stryker/commit/0c2fde5))

<a name="0.5.9"></a>

## [0.5.9](https://github.com/stryker-mutator/stryker/compare/v0.5.8...v0.5.9) (2017-03-01)

### Bug Fixes

- **fileUtilsSpec:** Fix test naming ([#240](https://github.com/stryker-mutator/stryker/issues/240)) ([f1321be](https://github.com/stryker-mutator/stryker/commit/f1321be))
- **IsolatedTestRunner:** Fix channel closed error ([#219](https://github.com/stryker-mutator/stryker/issues/219)) ([202d4b5](https://github.com/stryker-mutator/stryker/commit/202d4b5))

<a name="0.5.8"></a>

## [0.5.8](https://github.com/stryker-mutator/stryker/compare/v0.5.7...v0.5.8) (2017-02-03)

### Bug Fixes

- **bin/stryker:** Changed file permissions on stryker so it's executable on Linux ([#226](https://github.com/stryker-mutator/stryker/issues/226)) ([c1a5798](https://github.com/stryker-mutator/stryker/commit/c1a5798))
- **fs:** Use graceful-fs instead of fs directly ([#221](https://github.com/stryker-mutator/stryker/issues/221)) ([4c1bf41](https://github.com/stryker-mutator/stryker/commit/4c1bf41))
- **typo:** change not coverage to no coverage ([f2c7198](https://github.com/stryker-mutator/stryker/commit/f2c7198))

### Features

- **ArrayDeclarationMutator:** Add new mutator. ([#229](https://github.com/stryker-mutator/stryker/issues/229)) ([9805917](https://github.com/stryker-mutator/stryker/commit/9805917))

<a name="0.5.7"></a>

## [0.5.7](https://github.com/stryker-mutator/stryker/compare/v0.5.6...v0.5.7) (2017-01-16)

### Features

- **append-only-progress:** Implement new reporter ([#213](https://github.com/stryker-mutator/stryker/issues/213)) ([7b68506](https://github.com/stryker-mutator/stryker/commit/7b68506))

<a name="0.5.6"></a>

## [0.5.6](https://github.com/stryker-mutator/stryker/compare/v0.5.5...v0.5.6) (2016-12-31)

### Bug Fixes

- **InputFileResolver:** Don't ignore all files ([#210](https://github.com/stryker-mutator/stryker/issues/210)) ([ef3dde4](https://github.com/stryker-mutator/stryker/commit/ef3dde4))

<a name="0.5.5"></a>

## [0.5.5](https://github.com/stryker-mutator/stryker/compare/v0.5.4...v0.5.5) (2016-12-30)

### Features

- **ClearTextReporter:** Limit the number of tests ([142de71](https://github.com/stryker-mutator/stryker/commit/142de71))
- **ConfigReader:** Look for stryker.conf.js in the CWD ([#209](https://github.com/stryker-mutator/stryker/issues/209)) ([d196fd3](https://github.com/stryker-mutator/stryker/commit/d196fd3))
- **InputfileResolver:** exclude online files from globbing ([#194](https://github.com/stryker-mutator/stryker/issues/194)) ([a114594](https://github.com/stryker-mutator/stryker/commit/a114594))
- **lifetime-support:** Remove 0.12 node support ([38f72ae](https://github.com/stryker-mutator/stryker/commit/38f72ae))
- **progress-reporter:** Create new progress reporter ([#202](https://github.com/stryker-mutator/stryker/issues/202)) ([11c345e](https://github.com/stryker-mutator/stryker/commit/11c345e))
- **ProgressReporter:** add new line after report ([#193](https://github.com/stryker-mutator/stryker/issues/193)) ([931c35f](https://github.com/stryker-mutator/stryker/commit/931c35f))
- **ts21:** Upgrade to TypeScript 2.1 ([#203](https://github.com/stryker-mutator/stryker/issues/203)) ([4ce1d16](https://github.com/stryker-mutator/stryker/commit/4ce1d16))

<a name="0.5.4"></a>

## [0.5.4](https://github.com/stryker-mutator/stryker/compare/v0.5.3...v0.5.4) (2016-12-15)

### Features

- **es2015-promise:** Remove dep to es6-promise ([#189](https://github.com/stryker-mutator/stryker/issues/189)) ([3a34fe1](https://github.com/stryker-mutator/stryker/commit/3a34fe1))
- **exclude-files:** Exclude files with a `!` ([#188](https://github.com/stryker-mutator/stryker/issues/188)) ([05a356d](https://github.com/stryker-mutator/stryker/commit/05a356d))
- **sandbox:** Change cwd in `Sandbox`es ([#187](https://github.com/stryker-mutator/stryker/issues/187)) ([28e1e5d](https://github.com/stryker-mutator/stryker/commit/28e1e5d))

<a name="0.5.3"></a>

## [0.5.3](https://github.com/stryker-mutator/stryker/compare/v0.5.2...v0.5.3) (2016-11-26)

### Features

- **test-runner:** Config for `maxConcurrentTestRunners` ([492bb80](https://github.com/stryker-mutator/stryker/commit/492bb80))

<a name="0.5.2"></a>

## [0.5.2](https://github.com/stryker-mutator/stryker/compare/v0.5.1...v0.5.2) (2016-11-21)

### Bug Fixes

- **coverage:** Make 'perTest' work with dry-run ([d700f20](https://github.com/stryker-mutator/stryker/commit/d700f20))

<a name="0.5.1"></a>

## [0.5.1](https://github.com/stryker-mutator/stryker/compare/v0.5.0...v0.5.1) (2016-11-20)

### Bug Fixes

- **.npmignore:** Add temp folder to npm ignore ([07d1406](https://github.com/stryker-mutator/stryker/commit/07d1406))
- **istanbul:** Add dependency to istanbul ([729d770](https://github.com/stryker-mutator/stryker/commit/729d770))

<a name="0.5.0"></a>

# [0.5.0](https://github.com/stryker-mutator/stryker/compare/v0.4.5...v0.5.0) (2016-11-20)

### Bug Fixes

- **clear-text-reporter:** Fix a typo ([0e009dc](https://github.com/stryker-mutator/stryker/commit/0e009dc))

### Features

- **cli:** Add support for commands ([#181](https://github.com/stryker-mutator/stryker/issues/181)) ([fd824de](https://github.com/stryker-mutator/stryker/commit/fd824de))
- **one-pass-coverage:** Support one-pass coverage measurement ([#165](https://github.com/stryker-mutator/stryker/issues/165)) ([1796c93](https://github.com/stryker-mutator/stryker/commit/1796c93))

<a name="0.4.5"></a>

## [0.4.5](https://github.com/stryker-mutator/stryker/compare/v0.4.4...v0.4.5) (2016-10-29)

### Bug Fixes

- **BlockStatementMutator:** Not mutate empty block ([#160](https://github.com/stryker-mutator/stryker/issues/160)) ([da4a3cf](https://github.com/stryker-mutator/stryker/commit/da4a3cf))
- **stryker:** Stop running if there are no mutants ([#161](https://github.com/stryker-mutator/stryker/issues/161)) ([8f68da8](https://github.com/stryker-mutator/stryker/commit/8f68da8))

<a name="0.4.4"></a>

## [0.4.4](https://github.com/stryker-mutator/stryker/compare/v0.4.3...v0.4.4) (2016-10-04)

### Bug Fixes

- **line-endings:** Enforce unix line endings ([#152](https://github.com/stryker-mutator/stryker/issues/152)) ([554c167](https://github.com/stryker-mutator/stryker/commit/554c167))
- **MutantRunResultMatcher:** False positive fix ([#155](https://github.com/stryker-mutator/stryker/issues/155)) ([255f84b](https://github.com/stryker-mutator/stryker/commit/255f84b)), closes [#155](https://github.com/stryker-mutator/stryker/issues/155)

### Features

- **ts2.0:** Migrate to typescript 2.0 ([#154](https://github.com/stryker-mutator/stryker/issues/154)) ([1c5db5c](https://github.com/stryker-mutator/stryker/commit/1c5db5c))

<a name="0.4.3"></a>

## [0.4.3](https://github.com/stryker-mutator/stryker/compare/v0.1.0...v0.4.3) (2016-09-09)

### Bug Fixes

- **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([3b7e9f9](https://github.com/stryker-mutator/stryker/commit/3b7e9f9))
- **deps:** Set version of stryker-api ([338d8ec](https://github.com/stryker-mutator/stryker/commit/338d8ec))
- **isolated-test-runner:** Support regexes ([#146](https://github.com/stryker-mutator/stryker/issues/146)) ([51b6903](https://github.com/stryker-mutator/stryker/commit/51b6903))
- **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([4a88b58](https://github.com/stryker-mutator/stryker/commit/4a88b58))
- **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([b35e223](https://github.com/stryker-mutator/stryker/commit/b35e223))
- **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([53651b2](https://github.com/stryker-mutator/stryker/commit/53651b2))
- **test-deps:** Set version of stryker-api in it ([a094e4b](https://github.com/stryker-mutator/stryker/commit/a094e4b))
- **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([b03e84b](https://github.com/stryker-mutator/stryker/commit/b03e84b))
- **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([a3c8902](https://github.com/stryker-mutator/stryker/commit/a3c8902))
- **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([1f6a05a](https://github.com/stryker-mutator/stryker/commit/1f6a05a))

### Features

- **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([8aca3bd](https://github.com/stryker-mutator/stryker/commit/8aca3bd))
- **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([0675864](https://github.com/stryker-mutator/stryker/commit/0675864))
- **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([916ae55](https://github.com/stryker-mutator/stryker/commit/916ae55))

<a name="0.4.2"></a>

## [0.4.2](https://github.com/stryker-mutator/stryker/compare/v0.1.0...v0.4.2) (2016-08-09)

### Bug Fixes

- **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([3b7e9f9](https://github.com/stryker-mutator/stryker/commit/3b7e9f9))
- **deps:** Set version of stryker-api ([338d8ec](https://github.com/stryker-mutator/stryker/commit/338d8ec))
- **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([4a88b58](https://github.com/stryker-mutator/stryker/commit/4a88b58))
- **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([b35e223](https://github.com/stryker-mutator/stryker/commit/b35e223))
- **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([53651b2](https://github.com/stryker-mutator/stryker/commit/53651b2))
- **test-deps:** Set version of stryker-api in it ([a094e4b](https://github.com/stryker-mutator/stryker/commit/a094e4b))
- **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([b03e84b](https://github.com/stryker-mutator/stryker/commit/b03e84b))
- **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([a3c8902](https://github.com/stryker-mutator/stryker/commit/a3c8902))
- **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([1f6a05a](https://github.com/stryker-mutator/stryker/commit/1f6a05a))

### Features

- **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([8aca3bd](https://github.com/stryker-mutator/stryker/commit/8aca3bd))
- **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([0675864](https://github.com/stryker-mutator/stryker/commit/0675864))
- **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([916ae55](https://github.com/stryker-mutator/stryker/commit/916ae55))

<a name="0.4.1"></a>

## [0.4.1](https://github.com/stryker-mutator/stryker/compare/v0.4.0...v0.4.1) (2016-07-22)

### Features

- **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([bea5f11](https://github.com/stryker-mutator/stryker/commit/bea5f11))

<a name="0.4.0"></a>

# [0.4.0](https://github.com/stryker-mutator/stryker/compare/v0.3.2...v0.4.0) (2016-07-21)

### Bug Fixes

- **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([60191e3](https://github.com/stryker-mutator/stryker/commit/60191e3))
- **deps:** Set version of stryker-api ([aa51dc1](https://github.com/stryker-mutator/stryker/commit/aa51dc1))
- **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([e3f3ce1](https://github.com/stryker-mutator/stryker/commit/e3f3ce1))
- **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([f7eda47](https://github.com/stryker-mutator/stryker/commit/f7eda47))
- **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([84790f2](https://github.com/stryker-mutator/stryker/commit/84790f2))
- **test-deps:** Set version of stryker-api in it ([e006ade](https://github.com/stryker-mutator/stryker/commit/e006ade))
- **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([564f15c](https://github.com/stryker-mutator/stryker/commit/564f15c))
- **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([7f0b26a](https://github.com/stryker-mutator/stryker/commit/7f0b26a))
- **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([55afd5e](https://github.com/stryker-mutator/stryker/commit/55afd5e))

### Features

- **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([6c0e229](https://github.com/stryker-mutator/stryker/commit/6c0e229))
- **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([c66e380](https://github.com/stryker-mutator/stryker/commit/c66e380))

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
