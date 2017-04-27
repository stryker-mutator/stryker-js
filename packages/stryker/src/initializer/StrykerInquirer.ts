import * as inquirer from 'inquirer';
import * as _ from 'lodash';
import { filterEmpty } from '../utils/objectUtils';

export interface PromptResult {
  additionalNpmDependencies: string[];
  additionalConfig: object;
}

export class StrykerInquirer {

  public prompt(): Promise<PromptResult> {
    return inquirer.prompt(this.buildQuestions())
      .then(answers => {
        const chosenTestFramework = allOptions.testFrameworks.filter(testFramework => testFramework.name === answers['testFramework'])[0];
        const chosenTestRunner = allOptions.testRunners.filter(testRunner => testRunner.name === answers['testRunner'])[0];
        const result: PromptResult = {
          additionalNpmDependencies: filterEmpty([chosenTestFramework.npm, chosenTestRunner.npm]),
          additionalConfig: _.assign({}, chosenTestFramework.config, chosenTestRunner.config)
        };
        return result;
      });
  }


  /**
  * Build a Questions object as input for inquirer.prompt
  * @function
  */
  private buildQuestions(): inquirer.Question[] {
    return [
      {
        type: 'list',
        name: 'testRunner',
        message: 'Which Test Runner do you use?',
        choices: allOptions.testRunners.map(runner => runner.name),
        default: 'Mocha'
      },
      {
        type: 'list',
        name: 'testFramework',
        message: 'Which Test Framework do you use?',
        choices: allOptions.testFrameworks.map(framework => framework.name),
        default: 'Mocha'
      }
    ];
  }
}

interface Option {
  name: string;
  npm: string | null;
  config: object;
}

const allOptions: {
  testRunners: Option[],
  testFrameworks: Option[]
} = {
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
        testRunner: 'karma',
        karmaConfigFile: './karma.conf.js'
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
    ]
  };