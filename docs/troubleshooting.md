---
title: Troubleshooting
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/troubleshooting.md
---

Below you'll find an ever-growing list of issues that you might occur when running StrykerJS on your project for the first time.

### Build command fails

Example:

> ```
>  ERROR Stryker Unexpected error occurred while running Stryker Error: Command failed with exit code 1:
>  my-build-command
> ```

If you're running into issues with your `buildCommand`, try to execute it by hand to make sure it works. For example, if your `buildCommand` is `"tsc -b path/to/tsconfig.json"`, try to run `npx tsc  -b path/to/tsconfig.json` yourself, did it have the desired effect?

If that works, the next step would be to try the command yourself _inside the Stryker sandbox directory_. Please `cd` into the `.stryker-tmp/sandbox-xxxxx` directory and try the command there. For example:

```shell
cd .stryker-tmp/sandbox-12345678
node ../../node_modules/typescript/bin/tsc -b path/to/tsconfig.json
```

**Note**: since the sandbox dir doesn't have you node_modules, you will need to specify the full path to the TypeScript compiler.

### Initial test run fails 

Example:

> ```
> One or more tests resulted in an error
> [...] Cannot assign to 'stryNS_9fa48' because it is not a variable [...]
> ```

The initial test run might fail when you're using ts-jest or ts-node. The reason for this is that Stryker will mutate your code and, by doing so, introduce type errors into your code. Stryker tries to ignore these errors by adding [`// @ts-nocheck`](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/#ts-nocheck-in-typescript-files) in your source files. However, this is only done for TypeScript-like files inside your `lib`, `src`, and `test` directories by default. If you have your code somewhere else, you will need to override [disableTypeChecks](./configuration.md#disabletypechecks-false--string) yourself:

```json
{
  "disableTypeChecks": "app/**/*.{js,ts,jsx,tsx,html,vue}"
}
```

Another cause might be that you're using TypeScript v3.7 or lower. In that case, you should update TypeScript to at least v3.7 or higher. Alternatively you can try to switch to another transpiler, like [babel](https://babeljs.io/docs/en/babel-preset-typescript), but, honestly, updating TypeScript should be the first solution.

### No tests executed - Jest runner

You might run into issues like this when using the `@stryker-mutator/jest-runner`:

> ```
> No tests found, exiting with code 1
> Run with `--passWithNoTests` to exit with code 0
> ```

You will need to override the `tempDirName` to a directory without a `.` in front of it.

```json
{
   "tempDirName": "stryker-tmp"
}
```

See [#1691](https://github.com/stryker-mutator/stryker-js/issues/1691) for more info.

### All mutants survive - Jest runner

When running with the `@stryker-mutator/jest-runner` on windows you might run into the issue where all mutants survive unexpectedly:

> ```
> [...]
> #3. [Survived] ArithmeticOperator
> C:\z\github\stryker-mutator\stryker-js\e2e\test\jest-node\src\sum.js:5:10
> -     return a - b;
> +     return a + b;
> Ran all tests for this mutant.
> 
> Ran 0.00 tests per mutant on average.
> ----------|---------|----------|-----------|------------|----------|---------|
> File      | % score | # killed | # timeout | # survived | # no cov | # error |
> ----------|---------|----------|-----------|------------|----------|---------|
> All files |    0.00 |        0 |         0 |          4 |        0 |       0 |
>  sum.js   |    0.00 |        0 |         0 |          4 |        0 |       0 |
> ----------|---------|----------|-----------|------------|----------|---------|
> ```

The root cause for this is that Jest doesn't support running in a hidden directory on windows, like StrykerJS does by default (the sandbox directory is located in `.stryker-tmp`, a hidden directory). See [issue 9728](https://github.com/facebook/jest/issues/9728) for more info.

Known workarounds:

1. Change the [`tempDirName`](./configuration.md#tempdirname-string) to a non-hidden directory, for example `--tempDirName stryker-tmp`.
2. You can also choose to run Stryker in place, using [`--inPlace`](./configuration.md#inplace-boolean)


### Jest crashes with a multi project configuration

Example:

> ```
>  ERROR DryRunExecutor One or more tests resulted in an error:
>         Test runner crashed. Tried twice to restart it without any luck. Last time the error message was:
> Error: Jest: Cannot use configuration as an object without a file path.
>     at readConfig (C:\z\github\jest-issue\node_modules\jest-config\build\index.js:188:13)
> ```

This can happen when you have multiple [`"projects"`](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig) defined in your Jest configuration. Currently, the jest-runner uses the `runCli` of Jest, which doesn't support this. However, [the PR that adds support for this just merged](https://github.com/facebook/jest/pull/11307), so future releases of Jest should work. 

Until then, the only known workaround is to configure Jest without using "projects" 🤷‍♂️.

### Stryker generates mutants that survive, but are not compiled by TypeScript
If you are using TypeScript, it may happen that StrykerJS generates a mutant that survives, but is not compilable by TypeScript.

**Example**:

In your production TS code, you have the following statement:
```ts
let typesWithLabelsObjects: ComponentData[] = new Array<ComponentData>();
```

and one of the mutants generated by StrykerJS is the following `ArrayMutation` one:
```ts
let typesWithLabelsObjects: ComponentData[] = new Array([]);
```

However, if you try to introduce such a change to your TypeScript code manually, the TypeScript's compiler will not compile this. In our example, you'd get the following compilation error:
```
Type 'any[][]' is not assignable to type 'ComponentData[]'.
  Type 'any[]' is missing the following properties from type 'ComponentData': type, labelts(2322)
```

**Solution**:

To solve that, you need to add a [typescript-checker plugin](https://stryker-mutator.io/docs/stryker-js/typescript-checker/#configuring) to StrykerJS. Install it with `npm install --save-dev @stryker-mutator/typescript-checker` and then add the following options to your stryker's config file:
```
{
  "checkers": ["typescript"],
  "tsconfigFile": "tsconfig.json"
}
```

After adding this and running `npx stryker run` you may get errors similar to this one:
```
node_modules/@types/react/index.d.ts:3075:13 - error TS2717: Subsequent property declarations must have the same type.  Property 'rt' must be of type 'DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>', but here has type 'DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>'.
```

If that happens, add `"skipLibCheck": true` to your `tsconfig` file.
**Note**: adding `typescript-checker` to StykerJS makes types safety better and you get less false negative results, but it comes with a performance cost. Mutating may take more time with the checker plugin.

### Error when running StrykerJS: `Committing semi space failed. Allocation failed - JavaScript heap out of memory`
**Example**:

When running Stryker mutations, you may get an error similar to the following one:
```
16:58:25 (17452) INFO ConfigReader Using stryker.conf.json
16:58:26 (17452) INFO InputFileResolver Found 2 of 2557 file(s) to be mutated.
16:58:27 (17452) INFO Instrumenter Instrumented 2 source file(s) with 118 mutant(s)
16:58:28 (17452) INFO ConcurrencyTokenProvider Creating 6 checker process(es) and 5 test runner process(es).
16:59:40 (17452) INFO DryRunExecutor Starting initial test run. This may take a while.
16:59:53 (17452) INFO DryRunExecutor Initial test run succeeded. Ran 72 tests in 13 seconds (net 250 ms, overhead 12910 ms).
Mutation testing  [  ] 12% (elapsed: ~1m, remaining: ~7m) 15/118 tested (0 survived, 10 timed out)
<--- Last few GCs --->
[17452:0000022998429D50]    75135 ms: Scavenge 302.2 (313.0) -> 295.2 (313.0) MB, 0.8 / 0.2 ms  (average mu = 0.992, current mu = 0.975) task
[17452:0000022998429D50]   125511 ms: Scavenge 302.0 (313.0) -> 295.9 (313.2) MB, 1.3 / 0.0 ms  (average mu = 0.992, current mu = 0.975) task
[17452:0000022998429D50]   149148 ms: Scavenge 296.5 (301.2) -> 296.0 (301.7) MB, 2.3 / 0.2 ms  (average mu = 0.992, current mu = 0.975) allocation failure
<--- JS stacktrace --->
FATAL ERROR: Committing semi space failed. Allocation failed - JavaScript heap out of memory
 1: 00007FF61D741DDF napi_wrap+109135
 2: 00007FF61D6E6D06 v8::internal::OrderedHashTable<v8::internal::OrderedHashSet,1>::NumberOfElementsOffset+33350
```

**Solution**:

To solve that, you need to limit the number of workers. In the example about, 11 workers were created in total (6 checker processes and 5 test runner processes). In order to solve this issue, you may try to set `--concurrency` setting in your stryker config. In case of the sample issue, adding `"concurrency": 4` to `stryker.conf.json` solved the problem.

### Mutating fails: Cannot use the decorators and decorators-legacy plugin together

Example:

> ```
> ERROR Stryker Unexpected error occurred while running Stryker Error: Cannot use the decorators and decorators-legacy plugin together
>    at validatePlugins (okay_all in src\node_modules\@babel\parser\lib\index.js:10194:13)
>    at getParser (okay_all in src\node_modules\@babel\parser\lib\index.js:14528:5)
>    at parse (okay_all in src\node_modules\@babel\parser\lib\index.js:14511:12)
>    at parser (okay_all in src\node_modules\@babel\core\lib\parser\index.js:52:34)
>    at parser.next (<anonymous>)
>    at Object.parse (okay_all in src\node_modules\@babel\core\lib\parse.js:31:37)
>    at parse.next (<anonymous>)
>    at step (okay_all in src\node_modules\gensync\index.js:261:32)
>    at okay_all in src\node_modules\gensync\index.js:273:13
>    at async.call.result.err.err (okay_all in src\node_modules\gensync\index.js:223:11)
> ```

**Solution**:

Stryker JS uses [babel](https://babeljs.io/docs/en/) to parse and mutate your files. When parsing your your `.js` files, it reads in the `.babelrc` and `babel.config.js` files you have, but applies its own default plugins first. In rare circumstances, those default plugins are incompatible with your babel configuration.
  
Override the default babel plugins to solve this issue. For example, leaving it empty allows your own babel plugins to be used, without defaults from StrykerJS conflicting with it:
  
```
{
  "mutator": {
    "plugins": []
  }
}
```

Alternatively, you can start with the [default list defined in StrykerJS](https://github.com/stryker-mutator/stryker-js/blob/0c98f98649cecd7e7222cc5f168afbe1071099e5/packages/instrumenter/src/parsers/js-parser.ts#L8-L32) and start removing some of them until you get a working list.
  
  
