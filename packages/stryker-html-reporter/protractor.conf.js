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

if (process.env.TRAVIS) {
  // Use the travis selenium server spawned in the container, only firefox is working atm
  config.capabilities = {
    browserName: 'firefox'
  };
  config.seleniumAddress = 'http://localhost:4444/wd/hub';
  config.directConnect = false;
}

exports.config = config;
