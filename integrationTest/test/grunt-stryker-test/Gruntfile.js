'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    stryker: {
      withoutConfigFile: {
        files: {
          src: [
            'sampleProject/src/**/*.js',
            '!sampleProject/src/InfiniteAdd.js'
          ],
          tests: [
            'sampleProject/test/**/*.js',
            '!sampleProject/test/FailingAddSpec.js'
          ]
        },
        mutate: {
          src: [
            'sampleProject/src/**/*.js',
            '!sampleProject/src/InfiniteAdd.js'
          ]
        },
        options: {
          testFramework: 'jasmine',
          testRunner: 'karma',
          logLevel: 'debug'
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
