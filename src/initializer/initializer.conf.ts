export interface InitializerDefinitions {
  testRunners: TestRunnerDefinition[];
  testFrameworks: TestFrameworkDefinition[];
}

export interface Definition {
  name: string;
  npm: string;
  config: any;
}

export interface TestRunnerDefinition extends Definition {}
export interface TestFrameworkDefinition extends Definition {}

const config: InitializerDefinitions = {
    testRunners: [
      {
        name: 'Mocha',
        npm: 'stryker-mocha-runner',
        config: {
          testRunner: 'mocha'
        }
      },
      {
        name: 'Karma', 
        npm: 'stryker-karma-runner', 
        config: {
          testRunner: 'karma', 
          karmaConfigFile: './karma.conf.js'
        }
      }
    ],
    testFrameworks: [
      {
        name: 'Mocha',
        npm: '',
        config: {
          testFramework: 'mocha'
        }
      },
      {
        name: 'Jasmine',
        npm: 'stryker-jasmine',
        config: {
          testFramework: 'jasmine'
        }
      }
    ]
};

export default config;
