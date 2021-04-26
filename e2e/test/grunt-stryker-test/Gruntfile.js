module.exports = function (grunt) {
  grunt.initConfig({
    stryker: {
      withoutConfigFile: {
        files: {
          src: [
            'sampleProject/src/**/*.js'
          ],
          tests: [
            'sampleProject/test/**/*.js'
          ]
        },
        mutate: {
          src: [
            'sampleProject/src/**/*.js'
          ]
        },
        options: {
          testRunner: 'karma',
          logLevel: 'info',
          concurrency: 2,
          tempDirName: '.stryker-tmp-2',
          karma: { config: { files: [ 'sampleProject/**' ] }}
        },
      },
      withConfigFile: {
        options: {
          configFile: './stryker.grunt.conf.json'
        }
      }
    }
  });

  require('grunt-stryker/tasks/stryker')(grunt);
  grunt.registerTask('test', ['stryker']);
};
