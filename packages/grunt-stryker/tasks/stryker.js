'use strict';

var Stryker = require('stryker').default;

module.exports = function(grunt) {

  grunt.registerMultiTask('stryker', 'The extendable JavaScript mutation testing framework.', function() {
    var target = this.name + "." + this.target + ".";
    var filesProperty = target + 'files';
    var mutateProperty = target + 'mutate';

    grunt.config.requires(filesProperty);
    grunt.config.requires(mutateProperty);

    var files = grunt.file.expand(grunt.util.toArray(grunt.config.get(filesProperty)));
    var mutate = grunt.file.expand(grunt.util.toArray(grunt.config.get(mutateProperty)));

    var done = this.async();
    var stryker = new Stryker(mutate, files, this.options());
    stryker.runMutationTest(function() {
      done();
    });

  });

};
