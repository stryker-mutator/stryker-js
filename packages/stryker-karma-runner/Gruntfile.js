'use strict';

module.exports = function (grunt) {

  grunt.initConfig({

    clean: {
      build: {
        src: ['+(test|src)/**/*+(.d.ts|.js|.map)', '*+(.js|.d.ts|.map)', '!src/resources/**/*.*', '!Gruntfile.js', '!protractor.conf.js']
      },
      coverage: {
        src: ['coverage']
      },
      reports: {
        src: ['reports']
      }
    },

    watch: {
      testFiles: {
        files: ['**/*.js'],
        tasks: ['mochaTest:unit']
      }
    },
    mochaTest: {
      unit: {
        options: {
          reporter: 'spec'
        },
        src: ['test/helpers/**/*.js', 'test/unit/**/*.js']
      },
      integration: {
        options: {
          reporter: 'spec',
          timeout: 5000
        },
        // Register helpers before, it includes a log4js mock which has to be loaded as early as possible
        src: ['test/helpers/**/*.js', 'test/integration/**/*.js']
      }
    },
    mocha_istanbul: {
      coverage: {
        // Register helpers before, it includes a log4js mock which has to be loaded as early as possible
        src: ['test/helpers/**/*.js', 'test/unit/**/*.js', 'test/integration/**/*.js'],
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

    ts: {
      options: {
        failOnTypeErrors: true
      },
      build: {
        tsconfig: true,
      },
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-ts');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('watch-test', ['test', 'watch']);
  grunt.registerTask('test', ['build', 'coverage' ]);
  grunt.registerTask('build', ['clean', 'ts']);
  grunt.registerTask('integration', ['mochaTest:integration']);
  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
  grunt.registerTask('serve', ['watch']);
};
