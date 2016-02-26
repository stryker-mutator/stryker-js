'use strict';

module.exports = function (grunt) {

  grunt.initConfig({

    clean: {
      dist: {
        src: ['dist']
      },
      coverage: {
        src: ['coverage']
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'dist/src/**/*.js', 'dist/test/**/*.js'],
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
        src: ['dist/test/unit/**/*.js']
      },
      integration: {
        options: {
          reporter: 'spec',
          timeout: 5000
        },
        src: ['dist/test/integration/**/*.js']
      }
    },
    /* Start code coverage */
    mocha_istanbul: {
      coverage: {
        src: ['dist/test/integration/**/*.js', 'dist/test/unit/**/*.js'],
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

    ts: {
      options: {
        failOnTypeErrors: true
      },
      build: {
        tsconfig: true
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-ts');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('watch-test', ['test', 'watch']);
  grunt.registerTask('test', ['build', 'coverage']);
  grunt.registerTask('build', ['clean', 'ts']);
  grunt.registerTask('integration', ['mochaTest:integration']);
  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);

};
