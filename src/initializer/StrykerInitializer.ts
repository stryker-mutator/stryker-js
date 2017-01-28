'use strict';

import * as inquirer from 'inquirer';
import config from './initializer.conf';
import { ContextChoices } from './contextChoices';


export default class StrykerInitializer {
  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  initialize(): void {
    const contextChoices = this.promptContextChoices()
      .then((contextChoices) => {
        console.log(contextChoices);
      });
  };

  /**
  * Runs mutation testing. This may take a while.
  * @function
  */
  promptContextChoices(): Promise<ContextChoices> {
    console.log(this.buildQuestions());
    return inquirer.prompt(this.buildQuestions())
      .then((answers) => {
        const possibleTestFrameworks = config.testFrameworks;
        const possibleTestRunners = config.testRunners;
        let chosenTestFramework;
        let chosenTestRunner;

        for (let i = 0; i < possibleTestFrameworks.length; i++) {
          if (possibleTestFrameworks[i].name === answers['testFramework']) {
            chosenTestFramework = possibleTestFrameworks[i];
          }
        }

        for (let i = 0; i < possibleTestRunners.length; i++) {
          if (possibleTestRunners[i].name === answers['testRunner']) {
            chosenTestRunner = possibleTestRunners[i];
          }
        }

        return new ContextChoices(chosenTestRunner, chosenTestFramework);
      });
        
  };

  /**
     * Runs mutation testing. This may take a while.
     * @function
     */
  buildQuestions(): inquirer.Questions {
    let testFrameworkChoices: Array<string> = [];
    const possibleTestFrameworks = config.testFrameworks;
    let testRunnerChoices: Array<string> = [];
    const possibleTestRunners = config.testRunners;

    for (let i = 0; i < possibleTestFrameworks.length; i++) {
      
      testFrameworkChoices.push(possibleTestFrameworks[i].name);
    }

    for (let i = 0; i < possibleTestRunners.length; i++) {
      testRunnerChoices.push(possibleTestRunners[i].name);
    }

    return [
      {
        type: 'list',
        name: 'testRunner',
        message: 'Which Test Runner do you use?',
        choices: testRunnerChoices,
        default: 'Mocha'
      },
      {
        type: 'list',
        name: 'testFramework',
        message: 'Which Test Framework do you use?',
        choices: testFrameworkChoices,
        default: 'Mocha'
      }
    ];
  };
}