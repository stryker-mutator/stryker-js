import Preset from './Preset';
import PresetConfiguration from './PresetConfiguration';
import * as os from 'os';

const handbookUrl = 'https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/angular.md#angular';

export class AngularPreset implements Preset {
  public readonly name = 'angular-cli';
  // Please keep config in sync with handbook
  private readonly dependencies = [
    'stryker',
    'stryker-karma-runner',
    '@stryker-mutator/typescript',
    'stryker-html-reporter'
  ];
  private readonly config = `{
        mutate: [
          'src/**/*.ts',
          '!src/**/*.spec.ts',
          '!src/test.ts',
          '!src/environments/*.ts'
        ],
        mutator: 'typescript',
        testRunner: 'karma',
        karma: {
          configFile: 'src/karma.conf.js',
          projectType: 'angular-cli',
          config: {
            browsers: ['ChromeHeadless']
          }
        },
        reporters: ['progress', 'clear-text', 'html'],
        maxConcurrentTestRunners: ${Math.floor(os.cpus().length / 2)}, // Recommended to use about half of your available cores when running stryker with angular.
        coverageAnalysis: 'off'
    }`;
  public async createConfig(): Promise<PresetConfiguration> {
    return { config: this.config, handbookUrl, dependencies: this.dependencies };
  }
}
