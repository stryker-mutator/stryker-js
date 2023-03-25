const conf = require('@vue/cli-service/webpack.config.js');
conf.entry = {
  tests: ['./test.js']
}
module.exports = conf;
