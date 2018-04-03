const path = require('path');
const webpack = require('webpack');
const getAppFromConfig = require('@angular/cli/utilities/app-utils').getAppFromConfig;
const WebpackTestConfig = require('@angular/cli/models/webpack-test-config').WebpackTestConfig;
const AngularCompilerPlugin = require('@ngtools/webpack/src/angular_compiler_plugin').AngularCompilerPlugin;

const appConfig = getAppFromConfig();
const testConfig = Object.assign({
  environment: 'dev',
  codeCoverage: false,
  sourcemaps: false,
  progress: true,
  preserveSymlinks: false,
});

const webpackConfig = new WebpackTestConfig(testConfig, appConfig).buildConfig();

webpackConfig.module.rules.forEach(rule => {
  if (rule.loader === '@ngtools/webpack') {
    delete rule.loader;
    rule.loaders = [
      {
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: path.join(process.cwd(), 'src', appConfig.testTsconfig)
        }
      }, 'angular2-template-loader'
    ]
  }
});
function root(__path) {
  return path.join(__dirname, __path);
}
webpackConfig.plugins = webpackConfig.plugins.filter(plugin => !(plugin instanceof AngularCompilerPlugin));
webpackConfig.plugins.unshift(
  new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)/, path.resolve(__dirname, './src'))
);

webpackConfig.output.path = path.resolve('_karma_webpack_/');
webpackConfig.output.publicPath = path.resolve('_karma_webpack_/');

// Delete global styles entry, we don't want to load them.
delete webpackConfig.entry.styles;
webpackConfig.devtool = false;
webpackConfig.cache = true;
webpackConfig.context = __dirname;
module.exports = webpackConfig;
