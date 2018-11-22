import StrykerPreset from './StrykerPreset';

export class AngularPreset extends StrykerPreset {
    public dependencies = [
        'stryker',
        'stryker-karma-runner',
        'stryker-typescript',
        'stryker-html-reporter'
    ];
    public conf = `{
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
}
