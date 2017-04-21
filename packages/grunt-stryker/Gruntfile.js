'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    stryker: {
      withoutConfigFile: {
        files: {
          src: [
            'testResources/sampleProject/src/**/*.js',
            '!testResources/sampleProject/src/InfiniteAdd.js'
          ],
          tests: [
            'testResources/sampleProject/test/**/*.js',
            '!testResources/sampleProject/test/FailingAddSpec.js'
          ]
        },
        mutate: {
          src: [
            'testResources/sampleProject/src/**/*.js',
            '!testResources/sampleProject/src/InfiniteAdd.js'
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
          configFile: './testResources/stryker.conf.js'
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tasks');
  
  grunt.registerTask('default', ['jshint', 'test']);
  grunt.registerTask('test', ['stryker']);
};
