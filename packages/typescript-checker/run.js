const { TypescriptChecker } = require('./dist/src/TypescriptChecker');
const { resolve } = require('path');
const { readFileSync } = require('fs');
const { default: MutantStatus } = require('@stryker-mutator/api/src/report/MutantStatus');

async function run() {
  const checker = new TypescriptChecker();
  await checker.initialize();
  const result = await checker.check({
    fileName: resolve(__dirname, 'src', 'add.ts'),
    mutatorName: 'foo',
    range: [59, 60],
    replacement: '-'
  });
  console.log(MutantStatus[result.mutantResult], result.reason);
  const result2 = await checker.check({
    fileName: resolve(__dirname, 'src', 'add.ts'),
    mutatorName: 'foo',
    range: [59, 60],
    replacement: '/'
  });
  console.log(MutantStatus[result2.mutantResult], result2.reason);
  const result3 = await checker.check({
    fileName: resolve(__dirname, 'src', 'subtract.ts'),
    mutatorName: 'foo',
    range: [61, 62],
    replacement: '+'
  });
  console.log(MutantStatus[result3.mutantResult], result3.reason);
}

run().catch(console.error);
