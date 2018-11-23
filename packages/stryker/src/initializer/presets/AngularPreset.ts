import StrykerPreset from './StrykerPreset';
import { StrykerPresetConfig } from './StrykerConf';

/**
 * More information can be found in the Stryker handbook:
 * https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/angular.md#angular
 */
export class AngularPreset extends StrykerPreset {
    public readonly name: string = 'angular';
    private readonly dependencies = [
        'stryker',
        'stryker-karma-runner',
        'stryker-typescript',
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
        // maxConcurrentTestRunners: 2, // Recommended to use about half of your available cores when running stryker with angular.
        coverageAnalysis: 'off'
    }`;
    public async createConfig(): Promise<StrykerPresetConfig> {
      return new StrykerPresetConfig(this.config, this.dependencies);
    }
}
