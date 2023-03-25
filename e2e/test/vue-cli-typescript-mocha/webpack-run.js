const webpack = require(require.resolve('webpack', { paths: [require.resolve('@vue/cli-service')]}));
const config = require('./webpack.test.config');

webpack(config, (err, stats) => { // Stats Object
  if (err || stats.hasErrors()) {
    console.error(err);
    console.error(stats);
    process.exitCode = 1;
  } else {
    console.log('Done webpack ✅')
  }
});
