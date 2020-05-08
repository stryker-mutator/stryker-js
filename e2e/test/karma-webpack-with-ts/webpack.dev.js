const path = require('path');
const context = __dirname;
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: ['./testResources', '.'],
  },
  entry: './src/index.ts',
  context,
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          projectReferences: true,
        },
      }
    ],
  },
  output: {
    path: path.resolve(context, 'dist'),
    filename: 'mutation-test-elements.js',
  },
};
