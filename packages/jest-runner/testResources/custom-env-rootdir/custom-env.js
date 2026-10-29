'use strict';

const fs = require('fs');
const NodeEnv = require('jest-environment-node');
const NodeEnvironment = NodeEnv.default ?? NodeEnv;

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    const marker = process.env.STRYKER_JEST_CUSTOM_ENV_MARKER;
    if (marker) {
      fs.appendFileSync(marker, 'constructed\n');
    }
  }
}

module.exports = CustomEnvironment;
