// @ts-nocheck
const fs = require('fs');

const strykerGlobalNamespace = process.env.__stryker__namespace;
if (!strykerGlobalNamespace) {
  throw new Error('Stryker global namespace not set');
}

global[strykerGlobalNamespace] = {};

const HIT_LIMIT = '__stryker__hit-limit';

if (process.env[HIT_LIMIT]) {
  global[strykerGlobalNamespace].hitLimit = +process.env[HIT_LIMIT];
  global[strykerGlobalNamespace].hitCount = 0;
}

process.on('exit', finalCleanup);

['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM'].forEach((signal) =>
  process.on(signal, (_, signalNumber) => {
    process.exit(128 + signalNumber);
  })
);

function finalCleanup() {
  fs.writeFileSync(`stryker-output-${process.pid}.json`, JSON.stringify(global[strykerGlobalNamespace]));
}
