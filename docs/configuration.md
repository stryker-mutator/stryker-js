---
title: Configuration
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/configuration.md
---

This page describes the available configuration options in Stryker's core package. Please keep in mind that your plugins might also need configuration, see your plugin's configuration page for that.

All configuration options can either be set via the command line or via a config file.

The [`files`](#files-string) and [`mutate`](#mutate-string) options (and some others) support globbing expressions using [node glob](https://github.com/isaacs/node-glob). See [the config file documentation](./config-file.md#glob-patterns) for more information.

### `allowConsoleColors` [`boolean`]

Default: `true`<br />
Command line: `--allowConsoleColors true`<br />
Config file: `"allowConsoleColors": true`

The `allowConsoleColors` value indicates whether Stryker should use colors in console.

### `buildCommand` [`string`]

Default: `undefined`<br />
Command line: `[-b|--buildCommand] "npm run build"`<br />
Config file: `"buildCommand": 'npm run build'`

Configure a build command to run after mutating the code, but before mutants are tested. This is generally used to transpile your code before testing.
Only configure this if your test runner doesn't take care of this already and you're not using just-in-time transpiler like `babel/register` or `ts-node`.

### `cleanTempDir` [`boolean`]

Default: `true`<br />
Command line: `--cleanTempDir false`<br />
Config file: `"cleanTempDir": false`

Choose whether or not to clean the temp dir (which is ".stryker-tmp" inside the current working directory by default) after a successful run. 
The temp dir will never be removed when the run failed for some reason (for debugging purposes).

### `concurrency` [`number`]

Default: `cpuCoreCount <= 4? cpuCoreCount : cpuCoreCount - 1`<br />
Command line: `--concurrency 4`<br />
Config file: `"concurrency": 4`

Set the concurrency of workers. Stryker will always run checkers and test runners in parallel by creating worker processes (note, not `worker_threads`). This defaults to `n-1` where `n` is the number of logical CPU cores available on your machine, unless `n <= 4`, in that case it uses `n`. This is a sane default for most use cases.

### `commandRunner` [`object`]

Default: `{ command: 'npm test' }`<br />
Command line: *none*<br />
Config file: `"commandRunner": { "command": "npm run mocha" }`

With `commandRunner`, you can specify the command to execute for running tests.

### `coverageAnalysis` [`string`]

Default: `off`<br />
Command line: `--coverageAnalysis perTest`<br />
Config file: `"coverageAnalysis": "perTest"`

With `coverageAnalysis` you specify which coverage analysis strategy you want to use.

Stryker can analyse code coverage results. This can potentially speed up mutation testing a lot, as only the tests covering a
particular mutation are tested for each mutant.
This does *not* influence the resulting mutation testing score. It only improves performance.

The possible values are:

* **off**: Stryker will not determine the code covered by tests during the initial test run phase. All tests will be executed for each mutant
during the mutation testing phase.

* **all**: Stryker will determine the code covered by your tests during the initial test run phase. Mutants without code coverage will be reported with `NoCoverage` and are not tested during the mutation testing phase. This requires your test runner plugin to report code coverage back to Stryker.
All official test runner plugins support this (`@stryker-mutator/mocha-runner`, `@stryker-mutator/jasmine-runner`, `@stryker-mutator/karma-runner` and `@stryker-mutator/jest-runner`), but the `command` test runner does not, since it just runs a command and has no way of knowing more information about your tests.

* **perTest**: Stryker will determine the code covered by your test per executed test during the initial test run phase. Only mutants actually covered by your
test suite are tested during the mutation testing phase.
Only the tests that cover a particular mutant are tested for each one. This requires your tests to be able to run independently of each other and in random order.

### `dashboard` [`DashboardOptions`]

Default: `{ baseUrl: 'https://dashboard.stryker-mutator.io/api/reports', reportType: 'mutationScore' }`<br />
Command line:
* `--dashboard.project github.com/my-org/my-project --dashboard.version branch-or-tag`
* `--dashboard.module my-module`
* `--dashboard.baseUrl https://dashboard.stryker-mutator.io/api/reports`
* `--dashboard.reportType full`

Config file: 

```json
{
  "dasboard": { 
    "project": "github.com/my-org/my-project", 
    "version": "branch-or-tag", 
    "module": "my-module", 
    "baseUrl": "https://dashboard.stryker-mutator.io/api/reports", 
    "reportType": "full" 
  }
}
```

Settings for the `dashboard` [reporter](#reporters-string). See the [dashboard documentation](../General/dashboard.md) for more info.

### `disableTypeChecks` [`false | string`]

Default: `"{test,src,lib}/**/*.{js,ts,jsx,tsx,html,vue}"`<br />
Command: *none*<br />
Config file: `"disableTypeChecks": false`

Configure a pattern that matches the files of which type checking has to be disabled. This is needed because Stryker will create (typescript) type errors when inserting the mutants in your code. Stryker disables type checking by inserting `// @ts-nocheck` atop those files and removing other `// @ts-xxx` directives (so they won't interfere with `@ts-nocheck`). The default setting allows these directives to be stripped from all JavaScript and friend files in `lib`, `src` and `test` directories. You can specify a different glob expression or set it to `false` to completely disable this behavior.

### `dryRunTimeoutMinutes` [`number`]

Default: `5`<br />
Command line: `--dryRunTimeoutMinutes 5`<br />
Config file: `"dryRunTimeoutMinutes": 5`

Use this option to configure an absolute timeout for the initial test run. Since it can take a while we use minutes as time unit.

### `fileLogLevel` [`string`]

Default: `off`<br />
Command line: `--fileLogLevel info`<br />
Config file: `"fileLogLevel": "info"`<br />

Set the log level that Stryker uses to write to the "stryker.log" file. Possible values: `off`, `fatal`, `error`, `warn`, `info`, `debug` and `trace`

### `files` [`string[]`]

Default: result of `git ls-files --others --exclude-standard --cached --exclude .stryker-tmp`<br />
Command line: `[--files|-f] src/**/*.js,a.js,test/**/*.js`<br />
Config file: `"files": ["src/**/*.js", "!src/**/index.js", "test/**/*.js"]`

With `files`, you can choose which files should be included in your test runner sandbox.
This is normally not needed as it defaults to all files not ignored by git.
Try it out yourself with this command: `git ls-files --others --exclude-standard --cached --exclude .stryker-tmp`.

If you do need to override `files` (for example: when your project does not live in a git repository),
you can override the files here.

When using the command line, the list can only contain a comma separated list of globbing expressions.
When using the config file you can provide an array with `string`s

You can *ignore* files by adding an exclamation mark (`!`) at the start of an expression.

### `inPlace` [`boolean`]

Default: `false`<br />
Command line: `--inPlace`<br />
Config file: `"inPlace": true`<br />

Determines whether or not Stryker should mutate your files in place. 
Note: mutating your files in place is generally not needed for mutation testing, unless you have a dependency in your project that is really dependent on the file locations (like "app-root-path" for example).

When `true`, Stryker will override your files, but it will keep a copy of the originals in the temp directory (using `tempDirName`) and it will place the originals back after it is done.

When `false` (default) Stryker will work in the copy of your code inside the temp directory.

### `logLevel` [`string`]

Default: `info`<br />
Command line: `--logLevel info`<br />
Config file: `"logLevel": "info"`

Set the log level that Stryker uses to write to the console. Possible values: `off`, `fatal`, `error`, `warn`, `info`, `debug` and `trace`

*Note*: Test runners are run as child processes of the Stryker Node process. All output (stdout) of the `testRunner` is logged as `trace`.
Thus, to see logging output from the test runner set the `logLevel` to `all` or `trace`.

### `maxConcurrentTestRunners` (DEPRECATED)

**DEPRECATED**. Please use [concurrency](#concurrency-number) instead. 

### `mutate` [`string[]`]

Default: `['{src,lib}/**/*.js?(x)', '!{src,lib}/**/__tests__/**/*.js?(x)', '!{src,lib}/**/?(*.)+(spec|test).js?(x)', '!{src,lib}/**/*+(Spec|Test).js?(x)']`<br />
Command line: `[--mutate|-m] src/**/*.js,a.js`<br />
Config file: `"mutate": ["src/**/*.js", "a.js"]`

With `mutate` you configure the subset of files to be mutated. These should be your _production code files_, and definitely not your test files.
The default will try to guess your production code files based on sane defaults. It reads like this:

* Include all js-like files inside the `src` or `lib` dir
  * Except files inside `__tests__` directories and file names ending with `test` or `spec`.

It is possible to specify exactly which code blocks to mutate by means of a _mutation range_. This can be done postfixing your file with `:startLine:startColumn:endLine:endColumn`. Some examples:
* `"src/app.js:1:0:11:0"` will mutate lines 1 through 10 inside app.js (10 included).
* `"src/app.js:5:4:6:4"` will mutate from line 5, column 4 through line 6 column 4 inside app.js (columns 4 are included).

*Note:* It is not possible to combine mutation range with a globbing expression in the same line.

### `mutator` [`MutatorDescriptor`]

Default: `{}`<br />
Command line: *none*<br />
Config file:  `"mutator": { "plugins": ["classProperties"], "excludedMutations": ["StringLiteral"] }`

* `plugins`: allows you to override the default [babel plugins](https://babeljs.io/docs/en/plugins) to use for JavaScript files.
By default, Stryker uses [a default list of babel plugins to parse your JS file](https://github.com/stryker-mutator/stryker-js/blob/master/packages/instrumenter/src/parsers/js-parser.ts#L8-L32). It also loads any plugins or presets you might have configured yourself with `.babelrc` or `babel.config.js` files.
In the rare situation where the plugins Stryker loads conflict with your own local plugins (for example, when using the decorators and decorators-legacy plugins together), you can override the `plugins` here to `[]`.
* `excludedMutations`: allow you to specify a [list of mutator names](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutator-types.md#supported-mutators) to be excluded (`ignored`) from the test run.

_Note: prior to Stryker version 4, the mutator also needed a `name` (or be defined as `string`). This is removed in version 4. Stryker now supports mutating of JavaScript and friend files out of the box, without the need for a mutator plugin._

### `plugins` [`string[]`]

Default: `['@stryker-mutator/*']`<br />
Command line: `--plugins @stryker-mutator/jasmine-framework,@stryker-mutator/karma-runner`<br />
Config file: `"plugins": ["@stryker-mutator/jasmine-framework", "@stryker-mutator/karma-runner"]`

With `plugins`, you can add additional Node modules for Stryker to load (or `require`).
By default, all `node_modules` starting with `@stryker-mutator/*` will be loaded, so you would normally not need to specify this option.
These modules should be installed right next to stryker. For a current list of plugins,
you can consult [npm](https://www.npmjs.com/search?q=stryker-plugin) or use one of the officially supported plugins.

### `reporters` [`string[]`]

Default: `['clear-text', 'progress', 'html']`<br />
Command line: `--reporters clear-text,progress,dots,dashboard,html,json`<br />
Config file: `"reporters": ["clear-text", "progress", "dots", "dashboard", "html", "json"]`

With `reporters`, you can set the reporters for Stryker to use.
These reporters can be used out of the box: `html`, `json`, `progress`, `clear-text`, `dots`, `dashboard` and `event-recorder`.
By default, `clear-text`, `progress`, `html` are active if no reporters are configured. See [reporter plugins](./plugins.md#reporters)
for a full description of each reporter.

The `html` reporter allows you to specify an output folder. This defaults to `reports/mutation/html`. The config for your config file is: `htmlReporter: { baseDir: 'mypath/reports/stryker' }`

The `json` reporter allows specifying an output file name (may also contain a path). The config for your config file is: `jsonReporter: { fileName: 'mypath/reports/mutation.json' }`

The `clear-text` reporter supports three additional config options:
* `allowColor` to use cyan and yellow in printing source file names and positions. This defaults to `true`, so specify as `clearTextReporter: { allowColor: false },` to disable if you must.
* `logTests` to log the names of unit tests that were run to allow mutants. By default, only the first three are logged. The config for your config file is: `clearTextReporter: { logTests: true },`
* `maxTestsToLog` to show more tests that were executed to kill a mutant when `logTests` is true. The config for your config file is: `clearTextReporter: { logTests: true, maxTestsToLog: 7 },`

The `dashboard` reporter sends a report to https://dashboard.stryker-mutator.io, enabling you to add a mutation score badge to your readme, as well as hosting your html report on the dashboard. It uses the [dashboard.*](#dashboard-dashboardoptions) configuration options.

### `symlinkNodeModules` [`boolean`]

Default: `true`<br />
Command line: *none*<br />
Config file: `"symlinkNodeModules": true`

The `symlinkNodeModules` value indicates whether Stryker should create a [symbolic link](https://nodejs.org/api/fs.html#fs_fs_symlink_target_path_type_callback)
to your current node_modules directory in the sandbox directories. This makes running your tests by Stryker behave
more like your would run the tests yourself in your project directory.
Only disable this setting if you really know what you are doing.

For example, [Jest](https://jestjs.io/) expects any plugins to be located at "./node_modules/..."
in the Sandbox directory. Another example can be running [karma](http://karma-runner.github.io/) tests where
you specify files from the 'node_modules/angular/...'. Without symlinking the
node_modules directory this would not be possible.

Stryker will look for the node_modules directory to use in the current basePath (or current working directory) and
its parent directories.

### `tempDirName` [`string`]

Default: `'.stryker-tmp'`<br />
Command line: `--tempDirName .stryker-tmp`<br />
Config file: `"tempDirName": '.stryker-tmp'`

Choose a different temp dir that Stryker uses for mutation testing. This directory will contain copies of your source code during a mutation test run.
It will be created if it not exists and is **entirely deleted** after a successful run, so change this with caution.

It is advised to use a directory inside the directory that holds your repository. This way `node_modules` are resolved as expected. Be sure to
not check-in your chosen temp directory in your `.gitignore` file.

### `testFramework` (DEPRECATED)

_Note: Use of "testFramework" is no longer needed. You can remove it from your configuration. Your test runner plugin now handles its own test framework integration_

### `testRunner` [`string`]

Default: `'command'`<br />
Command line: `--testRunner karma`<br />
Config file: `"testRunner": "karma"`

With `testRunner` you specify the test runner that Stryker uses to run your tests. The default value is `command`. The command runner runs a configurable bash/cmd command and bases the result on the exit code of that program (0 for success, otherwise failed). You can configure this command via the config file using the `commandRunner: { command: 'npm run mocha' }`. It uses `npm test` as the command by default.

The command test runner can be made to work in any use case, but comes with a performance
penalty, as Stryker cannot do any optimizations and just runs all tests for all mutants.
If possible, you should try to use one of the test runner plugins that hook into your test runner of choice.
For example: install and use the `@stryker-mutator/karma-runner` to use `karma` as a test runner.

### `testRunnerNodeArgs` [`string[]`]

Default: `[]`<br />
Command line: `--testRunnerNodeArgs "--inspect-brk --cpu-prof"`<br />
Config file: `"testRunnerNodeArgs": ["--inspect-brk", "--cpu-prof"]`

Configure arguments to be passed as exec arguments to the test runner child process. For example, running Stryker with `--timeoutMS 9999999 --concurrency 1 --testRunnerNodeArgs "--inspect-brk"` will allow you to debug the test runner child process. See `execArgv` of [`child_process.fork`](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options).

### `thresholds` [`object`]

Default: `{ high: 80, low: 60, break: null }`<br />
Command line: *none*<br />
Config file: `"thresholds": { "high": 80, "low": 60, "break": null }`

Description
Specify the thresholds for mutation score.

* `mutation score >= high`: Awesome! Reporters should color this green and happy.
* `high > mutation score >= low`: Warning! Reporters should color this orange/yellow. Watch yourself!
* `mutation score < low`: Danger! Reporters should color this in red. You're in danger!
* `mutation score < break`: Error! Stryker will exit with exit code 1, indicating a build failure. No consequence for reporters, though.

It is not allowed to only supply one value of the values (it's all or nothing). However, `high` and `low` values can be the same, making sure colors are either red or green. Set `break` to `null` (default) to never let your build fail.

### `timeoutFactor` [`number`]

Default: `1.5`<br />
Command line: `--timeoutFactor 1.5`<br />
Config file: `"timeoutFactor": 1.5`

See [Timeout in milliseconds](#timeoutms-number).

### `timeoutMS` [`number`]

Default: `5000`<br />
Command line: `--timeoutMS 5000`<br />
Config file: `"timeoutMS": 5000`


When Stryker is mutating code, it cannot determine indefinitely whether a code mutation results in an infinite loop (see [Halting problem](https://en.wikipedia.org/wiki/Halting_problem)).
In order to battle infinite loops, a test run gets killed after a certain period of time. This period is configurable with two settings: `timeoutMS` and `timeoutFactor`.
To calculate the actual timeout in milliseconds the, following formula is used:

```
timeoutForTestRunMs = netTimeMs * timeoutFactor + timeoutMS + overheadMs
```

Both `netTimeMs` and `overheadMs` are calculated during the initial test run. They are logged on `info` level. For example when `overheadMs` is 92 and `netTimeMs` is 5: `Initial test run succeeded. Ran 6 tests in 4 seconds (net 5 ms, overhead 92 ms).`

With `timeoutFactor` you can configure the allowed deviation relative to the time of a normal test run. Tweak this if you notice that mutants are prone to creating slower code, but not infinite loops.
`timeoutMS` lets you configure an absolute deviation. Use it, if you run Stryker on a busy machine and you need to wait longer to make sure that the code indeed entered an infinite loop.

### `transpilers` (DEPRECATED)

_Note: Support for "transpilers" plugins is removed since Stryker 4. You can now configure your own [buildCommand](#buildCommand-string)_
