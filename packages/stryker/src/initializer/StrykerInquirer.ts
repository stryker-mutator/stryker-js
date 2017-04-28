import * as inquirer from 'inquirer';
import * as _ from 'lodash';
import { filterEmpty } from '../utils/objectUtils';
import { Options } from './StrykerConfigOptions';

export interface PromptResult {
  additionalNpmDependencies: string[];
  additionalConfig: object;
}

export class StrykerInquirer {

  public prompt(options: Options): Promise<PromptResult> {
    return inquirer.prompt(this.buildQuestions(options))
      .then(answers => {
        const chosenTestFramework = options.testFrameworks.filter(testFramework => testFramework.name === answers['testFramework'])[0];
        const chosenTestRunner = options.testRunners.filter(testRunner => testRunner.name === answers['testRunner'])[0];
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
  private buildQuestions(options: Options): inquirer.Question[] {
    return [
      {
        type: 'list',
        name: 'testRunner',
        message: 'Which Test Runner do you use?',
        choices: options.testRunners.map(runner => runner.name),
        default: options.defaultTestRunner
      },
      {
        type: 'list',
        name: 'testFramework',
        message: 'Which Test Framework do you use?',
        choices: options.testFrameworks.map(framework => framework.name),
        default: options.defaultFrameWork
      }
    ];
  }
}