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
  config.capabilities = {
    browserName: 'firefox'
  };
}

exports.config = config;
