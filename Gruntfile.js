'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        node: true,
        globals: {
          jQuery: true
        },
        multistr: true,
        predef: [
          "describe",
          "xdescribe",
          "before",
          "beforeEach",
          "after",
          "afterEach",
          "xit",
          "it"
        ]
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'test']
    },
    mochaTest: {
      unit: {
        options: {
          reporter: 'spec'
        },
        src: ['test/unit/**/*.js']
      },
      integration: {
        options: {
          reporter: 'spec'
        },
        src: ['test/integration/**/*.js']
      }
    },
    /* Start code coverage */
    mocha_istanbul: {
      coverage: {
        src: ['test/integration/**/*.js', 'test/unit/**/*.js'],
      }
    },
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage*',
          check: {
            lines: 80,
            statements: 80
          }
        }
      }
    },
    /* End code coverage */
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('watch-test', ['test', 'watch']);
  grunt.registerTask('test', ['coverage', 'integration']);
  grunt.registerTask('integration', ['mochaTest:integration']);
  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);

};
