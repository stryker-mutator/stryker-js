'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

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
        src: ['test/helpers/**/*.js', 'test/unit/**/*.js']
      },
      integration: {
        options: {
          reporter: 'spec',
          timeout: 30000
        },
        // Register helpers before, it includes a log4js mock which has to be loaded as early as possible
        src: ['test/helpers/**/*.js', 'test/integration/**/*.js']
      }
    },
    mocha_istanbul: {
      coverage: {
        // Register helpers before, it includes a log4js mock which has to be loaded as early as possible
        src: ['test/helpers/**/*.js', 'test/unit/**/*.js', 'test/integration/**/*.js'],
        options: {
          timeout: 30000
        }
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
    },

    tslint: {
      src: {
        src: ['*.ts', 'src/**/*.ts']
      },
      test: {
        src: ['test/**/*.ts', 'testResources/module/*.ts']
      }
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
          },
          releaseCount: 0
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
  });

  grunt.registerTask('default', ['test']);
  grunt.registerTask('watch-test', ['test', 'watch']);
  grunt.registerTask('test', ['build', 'coverage', 'protractor']);
  grunt.registerTask('build', ['clean', 'tslint', 'copy', 'browserify', 'ts']);
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
