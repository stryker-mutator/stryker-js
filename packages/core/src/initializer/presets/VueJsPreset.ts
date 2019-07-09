import Preset from './Preset';
import inquirer = require('inquirer');
import PresetConfiguration from './PresetConfiguration';

const handbookUrl = 'https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/vuejs.md#vuejs';

/**
 * More information can be found in the Stryker handbook:
 * https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/vuejs.md#vuejs
 */
export class VueJsPreset implements Preset {
  public readonly name = 'vueJs';
  private readonly generalDependencies = [
    '@stryker-mutator/core',
    '@stryker-mutator/vue-mutator',
    '@stryker-mutator/html-reporter'
  ];

  private readonly jestDependency = '@stryker-mutator/jest-runner';
  private readonly jestConf = `{
      mutate: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.vue'],
      mutator: 'vue',
      testRunner: 'jest',
      jest: {
        // config: require('path/to/your/custom/jestConfig.js')
      },
      reporters: ['progress', 'clear-text', 'html'],
      coverageAnalysis: 'off'
    }`;

  private readonly karmaDependency = '@stryker-mutator/karma-runner';
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
      reporters: ['progress', 'clear-text', 'html'],
      coverageAnalysis: 'off'
    }`;

  public async createConfig(): Promise<PresetConfiguration> {
    const testRunnerChoices: inquirer.ChoiceType[] = ['karma', 'jest'];
    const testRunnerAnswers = await inquirer.prompt<{ testRunner: string }>({
      choices: testRunnerChoices,
      message: 'Which test runner do you want to use?',
      name: 'testRunner',
      type: 'list'
    });
    const scriptChoices: inquirer.ChoiceType[] = ['typescript', 'javascript'];
    const scriptAnswers = await inquirer.prompt<{ script: string }>({
      choices: scriptChoices,
      message: 'Which language does your project use?',
      name: 'script',
      type: 'list'
    });
    const chosenTestRunner = testRunnerAnswers.testRunner;
    const chosenScript = scriptAnswers.script;
    return {
      config: this.getConfigString(chosenTestRunner),
      dependencies: this.createDependencies(chosenTestRunner, chosenScript),
      handbookUrl
    };
  }

  private getConfigString(testRunner: string) {
    if (testRunner === 'karma') {
      return this.karmaConf;
    } else if (testRunner === 'jest') {
      return this.jestConf;
    } else {
      throw new Error(`Invalid test runner chosen: ${testRunner}`);
    }
  }

  private createDependencies(testRunner: string, script: string): string[] {
    const dependencies = this.generalDependencies;
    dependencies.push(this.getTestRunnerDependency(testRunner));
    dependencies.push(this.getScriptDependency(script));
    return dependencies;
  }

  private getScriptDependency(script: string): string {
    if (script === 'typescript') {
      return '@stryker-mutator/typescript';
    } else if (script === 'javascript') {
      return '@stryker-mutator/javascript-mutator';
    } else {
      throw new Error(`Invalid script chosen: ${script}`);
    }
  }

  private getTestRunnerDependency(testRunner: string): string {
    if (testRunner === 'karma') {
      return this.karmaDependency;
    } else if (testRunner === 'jest') {
      return this.jestDependency;
    } else {
      throw new Error(`Invalid test runner chosen: ${testRunner}`);
    }
  }
}
