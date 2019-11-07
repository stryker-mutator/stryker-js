module.exports = function (grunt) {
  grunt.initConfig({
    stryker: {
      withoutConfigFile: {
        files: {
          src: [
            'sampleProject/src/**/*.js'
          ],
          tests: [
            'sampleProject/test/**/*.js'
          ]
        },
        mutate: {
          src: [
            'sampleProject/src/**/*.js'
          ]
        },
        options: {
          testFramework: 'jasmine',
          testRunner: 'karma',
          logLevel: 'info',
          maxConcurrentTestRunners: 2,
          tempDirName: '.stryker-tmp-2'
        },
      },
      withConfigFile: {
        options: {
          configFile: './stryker.conf.js'
        }
      }
    }
  });

  require('grunt-stryker/tasks/stryker')(grunt);
  grunt.registerTask('test', ['stryker']);
};
