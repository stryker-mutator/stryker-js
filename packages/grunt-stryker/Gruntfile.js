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
      jasmine: {
        files: {
          src: [
            'test/sampleProject/src/**/*.js',
            '!test/sampleProject/src/InfiniteAdd.js'
          ],
          tests: [
            'test/sampleProject/test/**/*.js',
            '!test/sampleProject/test/FailingAddSpec.js'
          ]
        },
        mutate: {
          src: [
            'test/sampleProject/src/**/*.js',
            '!test/sampleProject/src/InfiniteAdd.js'
          ]
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
