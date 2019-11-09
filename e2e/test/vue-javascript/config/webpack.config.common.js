'use strict';

const VueLoaderPlugin      = require('vue-loader/lib/plugin');
const HtmlPlugin           = require('html-webpack-plugin');
const helpers              = require('./helpers');
const isDev                = process.env.NODE_ENV === 'development';

const webpackConfig = {
  entry: {
    polyfill: '@babel/polyfill',
    main: helpers.root('src', 'main'),
  },
  resolve: {
    extensions: [ '.js', '.vue' ],
    alias: {
      'vue$': isDev ? 'vue/dist/vue.runtime.js' : 'vue/dist/vue.runtime.min.js',
      '@': helpers.root('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: [ helpers.root('src') ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [ helpers.root('src') ]
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader' ,
          { loader: 'css-loader', options: { sourceMap: isDev } },
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlPlugin({ template: 'index.html', chunksSortMode: 'dependency' })
  ]
};

module.exports = webpackConfig;
