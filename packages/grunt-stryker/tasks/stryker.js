'use strict';

var Stryker = require('stryker').default;

module.exports = function (grunt) {

  grunt.registerMultiTask('stryker', 'The extendable JavaScript mutation testing framework.', function () {
    var target = this.name + "." + this.target + ".";
    var filesProperty = target + 'files';
    var mutateProperty = target + 'mutate';

    grunt.config.requires(filesProperty);
    grunt.config.requires(mutateProperty);

    var files = grunt.file.expand(grunt.util.toArray(grunt.config.get(filesProperty)));
    var mutate = grunt.file.expand(grunt.util.toArray(grunt.config.get(mutateProperty)));
    
    var strykerConfig = {
      files: files,
      mutate: mutate,
      logLevel: this.options().logLevel,
      testFramework: this.options().testFramework,
      testRunner: this.options().testRunner,
      timeoutMs: this.options().timeoutMs,
      timeoutFactor: this.options().timeoutFactor,
      plugins: this.options().plugins,
      port: this.options().port
    };

    var done = this.async();
    var stryker = new Stryker(strykerConfig);
    stryker.runMutationTest().then(function () {
      done();
    }, function () {
      grunt.fail.fatal("Stryker was unable to run the mutation test");
    });
  });

};
