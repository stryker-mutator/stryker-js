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
      },
      resources: {
        src: ['resources']
      },
      test: {
        src: ['testResources/module/node_modules/stryker-api']
      }
    },

    copy: {
      bootstrap: {
        src: ['**/*+(.css|.js)'],
        expand: true,
        dest: 'resources/bootstrap',
        cwd: 'node_modules/bootstrap/dist'
      },
      highlightjs: {
        src: ['node_modules/highlight.js/styles/default.css'],
        dest: 'resources/highlightjs/styles/default.css'
      }
    },

    browserify: {
      resources: {
        files: {
          'resources/stryker.js': ['src/resources/stryker.js']
        }
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
        src: ['test/unit/**/*.js']
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
    },

    protractor: {
      options: {
        configFile: "protractor.conf.js",
        keepAlive: false,
        noColor: false
      },
      ui: {
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('watch-test', ['test', 'watch']);
  grunt.registerTask('test', ['build', 'coverage', 'protractor']);
  grunt.registerTask('build', ['clean', 'copy', 'browserify', 'ts']);
  grunt.registerTask('integration', ['mochaTest:integration']);
  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
  grunt.registerTask('serve', ['watch']);
};
