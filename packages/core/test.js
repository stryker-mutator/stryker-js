// @ts-check
const { Instrumenter } = require('@stryker-mutator/instrumenter');
const { CheckStatus } = require('@stryker-mutator/api/check');
const { CheckerPool } = require('./src/checker/EagerCheckerPool');
const { default: InputFileResolver } = require('./src/input/InputFileResolver');
const { getLogger } = require('log4js');
const { LogConfigurator } = require('./src/logging/LogConfigurator');
const { from } = require('rxjs');
const { flatMap, tap, toArray } = require('rxjs/operators');
const fs = require('fs').promises;

async function run() {
  const clientContext = await LogConfigurator.configureLoggingServer('info', 'off', true);
  const logger = getLogger();
  logger.level = 'info';


  const inputFileResolver = new InputFileResolver(logger, { mutate: ['src/**/*.ts', '!src/**/*.d.ts'], files: undefined, tempDirName: '.stryker-tmp' }, {
    onAllSourceFilesRead() { },
    onSourceFileRead() { }
  })
  const instrumenter = new Instrumenter(logger);
  const strykerOptions = { checkers: ['typescript'], plugins: [require.resolve('../typescript-checker')], typescriptChecker: { tsconfigFile: 'tsconfig.src.json' } };
  const checker = new CheckerPool(strykerOptions, clientContext);

  const inputFiles = await inputFileResolver.resolve();
  const [{ mutants }] = await Promise.all([instrumenter.instrument(inputFiles.filesToMutate), checker.init()]);
  const start = new Date();
  console.time('check');
  const results = await from(mutants).pipe(
    flatMap(async mutant => {
      const startMutant = new Date();
      const result = await checker.check(mutant);
      /**
       * @type {[import('@stryker-mutator/api/check').CheckResult, import('@stryker-mutator/api/core').Mutant]}
       */
      return {
        result,
        mutant,
        time: (new Date()).valueOf() - startMutant.valueOf()
      };
    }, CheckerPool.CONCURRENCY),
    tap(({ result, mutant, time }) => console.log(`check (${time}ms) ${mutant.id} (${mutant.replacement}): ${result.status} (${result.reason})`)),
    toArray()
  ).toPromise()
  console.timeEnd('check');
  const timeSpent = new Date().valueOf() - start.valueOf();
  const passed = results.filter(({ result }) => result.status === CheckStatus.Passed).length;
  const avg = timeSpent / mutants.length;
  console.info(`${passed}/${mutants.length} passed`);
  console.info(`Check time is ${avg} ms on average`);
  await fs.writeFile('results.json', JSON.stringify({
    summary: {
      timeSpent,
      passed,
      avg
    },
    results
  }, null, 2));
  checker.dispose();
}

run().catch(console.error);
