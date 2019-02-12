const spawn = require('child_process').spawn;
const os = require('os');

var config = {
  directConnect: true,

  capabilities: {
    'browserName': 'chrome'
  },

  framework: 'mocha',

  specs: ['test/helpers/**/*.js', 'test/ui/**/*.js'],

  mochaOpts: {
    timeout: 30000
  }
};

exports.config = config;
