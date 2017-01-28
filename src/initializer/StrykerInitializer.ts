'use strict';

import * as inquirer from 'inquirer';
const npmi = require('npmi');
import * as fs from 'fs';

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

    installNpmDependencies(dependencies: Array<String>): boolean {
        console.log("Installing NPM dependencies: " + dependencies);

        let result: boolean = true;

        for (let dependency in dependencies) {
            npmi({name: dependency}, function(err: any, result: any) {
                if (err) {
                    if (err.code === npmi.LOAD_ERR) {
                        console.error("Failed installing " + dependency + ": load error");
                    } else if (err.code === npmi.INSTALL_ERR) {
                        console.error("Failed installing " + dependency + ": installation error");
                    }

                    result = false;
                } else {
                    console.log(dependency + "@latest: installed successfully");
                }
            })
        }
        return result;
    };

    installStrykerConfiguration(parameters: Object) {
        fs.readFile( __dirname + '/stryker.conf.js.template', function (err, data) {
            if (err) {
                throw err; 
            }

            let regExp: RegExp = new RegExp('%initializer_config%');
            let newParams: string = "";

            for (let param in parameters) {
                newParams += param + ": " + ", ";
            }

            console.log(data.toString().replace(regExp, newParams));
        });
    }
}