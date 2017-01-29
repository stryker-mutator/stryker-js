'use strict';

import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from "lodash";
import initializerConfig from './initializer.conf';
import strykerConfig from './stryker.conf';
import { ContextChoices } from './contextChoices';
import * as child from 'child_process';

export default class StrykerInitializer {
  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  initialize(): void {
    const contextChoices = this.promptContextChoices()
      .then((contextChoices) => {
        this.installNpmDependencies(this.buildNpmPackagesArray(contextChoices));
        this.installStrykerConfiguration(contextChoices);
      })
  };

  /**
  * Runs mutation testing. This may take a while.
  * @function
  */
  promptContextChoices(): Promise<ContextChoices> {
    return inquirer.prompt(this.buildQuestions())
      .then((answers) => {
        const possibleTestFrameworks = initializerConfig.testFrameworks;
        const possibleTestRunners = initializerConfig.testRunners;
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

  buildNpmPackagesArray(contextChoices: ContextChoices): Array<String> {
    let npmPackages = [];
    npmPackages.push('stryker-html-reporter');
    npmPackages.push(contextChoices.testFramework.npm);
    npmPackages.push(contextChoices.testRunner.npm);
    return npmPackages;
  }

  buildQuestions(): inquirer.Questions {
    let testFrameworkChoices: Array<string> = [];
    const possibleTestFrameworks = initializerConfig.testFrameworks;
    let testRunnerChoices: Array<string> = [];
    const possibleTestRunners = initializerConfig.testRunners;

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

  installNpmDependencies(dependencies: Array<String>): void {
    console.log('Installing NPM dependencies...');

    child.execSync(`npm i ${dependencies.join(' ')} --save-dev`, { stdio: [0, 1, 2] });
  };

  installStrykerConfiguration(contextChoices: ContextChoices): void {
    console.log('Installing Stryker configuration...');

    let configurationObject = strykerConfig;

    configurationObject = _.assign(configurationObject, contextChoices.testFramework.config);
    configurationObject = _.assign(configurationObject, contextChoices.testRunner.config);

    let newConfiguration = wrapInModule(JSON.stringify(configurationObject, null, 2));

    fs.writeFile(process.cwd() + path.sep + 'stryker.conf.js', newConfiguration, function (err) {
      if (err) {
        throw err;
      }
    });
  }
}

function wrapInModule(configParameters: string) { 
return `
  module.exports = function(config){
    config.set(
      ${configParameters}
    );
  }`;
}