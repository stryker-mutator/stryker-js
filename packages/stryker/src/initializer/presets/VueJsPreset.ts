import StrykerPreset from './StrykerPreset';
import inquirer = require('inquirer');
import { StrykerPresetConfig } from './StrykerConf';

/**
 * More information can be found in the Stryker handbook:
 * https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/vuejs.md#vuejs
 */
export class VueJsPreset extends StrykerPreset {
    private readonly generalDependencies = [
      'stryker',
      'stryker-vue-mutator',
      'stryker-html-reporter'
    ];

    private readonly jestDependency = 'stryker-jest-runner';
    private readonly jestConf = `{
      mutate: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.vue'],
      mutator: 'vue',
      testRunner: 'jest',
      jest: {
        // config: require('path/to/your/custom/jestConfig.js')
      },
      reporter: ['progress', 'clear-text', 'html'],
      coverageAnalysis: 'off'
    }`;

    private readonly karmaDependency = 'stryker-karma-runner';
    private readonly karmaConf = `{
      mutate: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.vue'],
      mutator: 'vue',
      testRunner: 'karma',
      karma: {
        configFile: 'test/unit/karma.conf.js',
        config: {
          browsers: ['ChromeHeadless']
        }
      },
      reporter: ['progress', 'clear-text', 'html'],
      coverageAnalysis: 'off'
    }`;

    public async createConfig(): Promise<StrykerPresetConfig> {
      const testRunnerChoices: inquirer.ChoiceType[] = ['karma', 'jest'];
      const testRunnerAnswers = await inquirer.prompt<{ testrunner: string }>({
        choices: testRunnerChoices,
        message: 'Which test runner do you want to use?',
        name: 'testrunner',
        type: 'list'
      });
      const scriptChoices: inquirer.ChoiceType[] = ['typescript', 'javascript'];
      const scriptAnswers = await inquirer.prompt<{ script: string }>({
        choices: scriptChoices,
        message: 'What script does your project use?',
        name: 'script',
        type: 'list'
      });
      const chosenTestRunner = testRunnerAnswers.testrunner;
      const chosenScript = scriptAnswers.script;
      return new StrykerPresetConfig(
        this.getConfigString(chosenTestRunner),
        this.createDependencies(chosenTestRunner, chosenScript)
      );
    }

    private getConfigString(testrunner: string) {
      if (testrunner === 'karma') {
        return this.karmaConf;
      } else if (testrunner === 'jest') {
        return this.jestConf;
      } else {
        throw new Error(`Invalid test runner chosen: ${testrunner}`);
      }
    }

    private createDependencies(testrunner: string, script: string): string[] {
      const dependencies = this.generalDependencies;
      dependencies.push(this.getTestRunnerDependency(testrunner));
      dependencies.push(this.getScriptDependency(script));
      return dependencies;
    }

    private getScriptDependency(script: string): string {
      if (script === 'typescript') {
        return 'stryker-typescript';
      } else if (script === 'javascript') {
        return 'stryker-javascript-mutator';
      } else {
        throw new Error(`Invalid script chosen: ${script}`);
      }
    }

    private getTestRunnerDependency(testrunner: string): string {
      if (testrunner === 'karma') {
        return this.karmaDependency;
      } else if (testrunner === 'jest') {
        return this.jestDependency;
      } else {
        throw new Error(`Invalid test runner chosen: ${testrunner}`);
      }
    }
}
