module.exports = function(config){
  config.set({
    files: ['testResources/sampleProject/src/?(Circle|Add).js', 'testResources/sampleProject/test/?(AddSpec|CircleSpec).js'],
    mutate: ['testResources/sampleProject/src/?(Circle|Add).js'],
    testFramework: 'jasmine',
    testRunner: 'karma'
  });
}