'use strict';

module.exports = function(grunt) {
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
          testRunner: 'karma'
        }
      },
      withConfigFile:{
        options:{
          configFile: 'testResources/stryker.conf.js'
        }
      }
    },
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['jshint', 'test']);
  grunt.registerTask('test', ['stryker']);

};
