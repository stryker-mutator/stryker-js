module.exports = function(config){
  config.set({
    files: ['../sampleProject/src/?(Circle|Add).js', '../sampleProject/test/?(AddSpec|CircleSpec).js'],
    mutate: ['../sampleProject/src/?(Circle|Add).js'],
    logLevel: 'debug'
  });
}