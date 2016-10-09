'use strict';


module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    clean: {
      build: {
        src: ['+(test|src)/**/*+(.d.ts|.js|.map)']
      },
      coverage: {
        src: ['coverage']
      }
    },

    watch: {
      testFiles: {
        files: ['test/**/*.js', 'src/**/*.js'],
        tasks: ['mochaTest:unit']
      }
    },
    mochaTest: {
      unit: {
        options: {
          reporter: 'spec'
        },
        // Register helpers before, it includes a log4js mock which has to be loaded as early as possible
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
    /* End code coverage */

    ts: {
      options: {
        failOnTypeErrors: true
      },
      build: {
        tsconfig: true,
      },
    },

    'npm-contributors': {
      options: {
        commitMessage: 'chore: update contributors'
      }
    },
    conventionalChangelog: {
      release: {
        options: {
          changelogOpts: {
            preset: 'angular'
          }
        },
        src: 'CHANGELOG.md'
      }
    },
    bump: {
      options: {
        commitFiles: [
          'package.json',
          'CHANGELOG.md'
        ],
        commitMessage: 'chore: release v%VERSION%',
        prereleaseName: 'rc'
      }
    },
    tslint: {
      src: {
        src: ['*.ts', 'src/**/*.ts']
      },
      test: {
        src: ['test/**/*.ts', 'testResources/module/*.ts']
      }
    }
  });

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['build', 'coverage']);
  grunt.registerTask('build', ['clean', 'tslint', 'ts']);
  grunt.registerTask('integration', ['mochaTest:integration']);
  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
  grunt.registerTask('serve', ['watch']);

  grunt.registerTask('release', 'Build, bump and publish to NPM.', function (type) {
    grunt.task.run([
      'test',
      'npm-contributors',
      'bump:' + (type || 'patch') + ':bump-only',
      'conventionalChangelog',
      'bump-commit',
      'npm-publish'
    ]);
  });

};
