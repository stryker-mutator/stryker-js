// @ts-nocheck
const fs = require('fs');

global.__stryker__ = {};

const HIT_LIMIT = '__stryker__hit-limit';
const IS_DRY_RUN = '__stryker__is-dry-run';

if (process.env[HIT_LIMIT]) {
  global.__stryker__.hitLimit = +process.env[HIT_LIMIT];
  global.__stryker__.hitCount = 0;
}

process.on('exit', finalCleanup);

['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM'].forEach((signal) =>
  process.on(signal, (_, signalNumber) => {
    process.exit(128 + signalNumber);
  })
);

function finalCleanup() {
  if (process.env[IS_DRY_RUN] === 'true') {
    fs.writeFileSync(`stryker-output-${process.pid}.json`, JSON.stringify(global.__stryker__));
  }
}
