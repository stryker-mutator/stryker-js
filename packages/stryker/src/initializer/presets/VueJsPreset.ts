import StrykerPreset from './StrykerPreset';
import inquirer = require('inquirer');

export class VueJsPreset extends StrykerPreset {
    public dependencies = [
      'stryker',
      'stryker-vue-mutator',
      'stryker-html-reporter'
    ];
    public conf: string;

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

    public async prompt(): Promise<void> {
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
      this.loadTestRunner(testRunnerAnswers.testrunner);
      this.loadScript(scriptAnswers.script);
    }

    private loadTestRunner(testrunner: string) {
      if (testrunner === 'karma') {
        this.dependencies.push(this.karmaDependency);
        this.conf = this.karmaConf;
      } else if (testrunner === 'jest') {
        this.dependencies.push(this.jestDependency);
        this.conf = this.jestConf;
      } else {
        throw new Error(`Invalid test runner chosen: ${testrunner}`);
      }
    }

    private loadScript(script: string) {
      if (script === 'typescript') {
        this.dependencies.push('stryker-typescript');
      } else if (script === 'javascript') {
        this.dependencies.push('stryker-javascript-mutator');
      } else {
        throw new Error(`Invalid script chosen: ${script}`);
      }
    }
}
