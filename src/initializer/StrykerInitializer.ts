'use strict';

import * as inquirer from 'inquirer';
import config from './initializer.conf';

export default class StrykerStrykerInitializer {
    /**
     * Runs mutation testing. This may take a while.
     * @function
     */
    inquire(): void {
        inquirer.prompt(this.buildQuestions()).then(function (answers) {
            console.log(JSON.stringify(answers, null, '  '));
        });
    };
    
    buildQuestions(): inquirer.Questions {
        return [
            {
                type: 'list',
                name: 'testRunner',
                message: 'Which Test Runner do you use?',
                choices: ['Karma', 'Mocha'],
                default: 'Mocha'
            },
            {
                type: 'list',
                name: 'testFramework',
                message: 'Which Test Framework do you use?',
                choices: ['Jasmine', 'Mocha'],
                default: 'Mocha'
            }
        ];
    };
}