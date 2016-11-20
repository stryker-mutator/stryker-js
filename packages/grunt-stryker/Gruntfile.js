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
          testRunner: 'karma'
        }
      },
      withConfigFile: {
        options: {
          configFile: 'testResources/stryker.conf.js'
        }
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
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tasks');
  
  grunt.registerTask('default', ['jshint', 'test']);
  grunt.registerTask('test', ['stryker']);

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
