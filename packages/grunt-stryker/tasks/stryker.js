'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('stryker', 'The extendable JavaScript mutation testing framework.', function () {
    var target = this.name + "." + this.target + ".";
    var filesProperty = target + 'files';
    var mutateProperty = target + 'mutate';

    var options = this.options();

    if (!options.configFile || options.configFile.length === 0) {
      grunt.config.requires(filesProperty);
      grunt.config.requires(mutateProperty);
    }

    var files = grunt.config.get(filesProperty);
    if (files) {
      // Flip blacklist to a whitelist
      options.ignorePatterns = ['**', ...grunt.file.expand(grunt.util.toArray(files)).map((file) => `!${file}`)];
    }

    var mutatedFiles = grunt.config.get(mutateProperty);
    if (mutatedFiles) {
      options.mutate = grunt.file.expand(grunt.util.toArray(mutatedFiles));
    }

    var done = this.async();
    import('@stryker-mutator/core').then(({Stryker}) => {
      var stryker = new Stryker(options);
      stryker.runMutationTest().then(function () {
        var success = true;
  
        if(process.exitCode > 0) {
          success = false;
        }
        done(success);
      }, function (error) {
          grunt.fail.fatal("Stryker was unable to run the mutation test. " + error);
      });
    });
  });

};
