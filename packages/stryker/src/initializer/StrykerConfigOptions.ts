export interface Option {
  name: string;
  npm: string | null;
  config: object;
}

export interface Options {
  testRunners: Option[];
  testFrameworks: Option[];
  defaultTestRunner: string;
  defaultFrameWork: string;
}

export const StrykerConfigOptions: Options = {
    testRunners: [{
      name: 'Mocha',
      npm: 'stryker-mocha-runner',
      config: {
        testRunner: 'mocha'
      }
    }, {
      name: 'Karma',
      npm: 'stryker-karma-runner',
      config: {
        testRunner: 'karma'
      }
    }],
    testFrameworks: [
      {
        name: 'Mocha',
        npm: null,
        config: {
          testFramework: 'mocha'
        }
      }, {
        name: 'Jasmine',
        npm: 'stryker-jasmine',
        config: {
          testFramework: 'jasmine'
        }
      }
    ],
    defaultFrameWork: 'Mocha',
    defaultTestRunner: 'Mocha'
  };