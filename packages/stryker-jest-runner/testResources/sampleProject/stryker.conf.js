module.exports = function(config){
  config.set({
    files: ['testResources/sampleProject/src/*.js', 'testResources/sampleProject/src/__tests__/*.js'],
    mutate: ['testResources/sampleProject/src/*.js'],
    testFramework: 'jasmine',
    testRunner: 'jest'
  });
};