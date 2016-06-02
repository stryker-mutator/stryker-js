module.exports = function(config){
  config.set({
    files: ['test/sampleProject/src/?(Circle|Add).js', 'test/sampleProject/test/?(AddSpec|CircleSpec).js'],
    mutate: ['test/sampleProject/src/?(Circle|Add).js'],
  });
}