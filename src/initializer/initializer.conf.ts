const config = {
    testRunners: [
      {
        name: 'Mocha',
        npm: 'stryker-mocha-runner',
        config: [{
          testRunner: 'mocha'
        }]
      },
      {
        name: 'Karma', 
        npm: 'stryker-karma-runner', 
        config: [{
          testRunner: 'karma', 
          karmaConfigFile: './karma.conf.js'
        }]
      }
    ],
    testFrameworks: [
      {
        name: 'Mocha',
        npm: '',
        config: [{
          testFramework: 'mocha'
        }]
      },
      {
        name: 'Jasmine',
        npm: 'stryker-jasmine',
        config: [{
          testFramework: 'jasmine'
        }]
      }
    ],  
    defaults: [{testRunner: 'Karma', testFramework: 'Mocha' }]
};

export default config;
