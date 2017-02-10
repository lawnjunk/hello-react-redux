'use strict';

require('dotenv').load();

const webpack = require('webpack');
const ExtractText = require('extract-text-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');

const production = process.env.NODE_ENV === 'prod';

let plugins = [
  new ExtractText('[hash].css'),
  new HTMLPlugin({template: `${__dirname}/app/index.html`}),
  new webpack.DefinePlugin({
    __DEBUG__: JSON.stringify(!production),
    __FIREBASE_CLIENT_ID__: JSON.stringify('luwat fake id'),
  })
];

if(production){
  plugins = plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      mangle: true,
      compress: {
        warnings: false,
        drop_console: false,
      }
    }),
  ]);
}

module.exports = {
  plugins,
  entry: `${__dirname}/app/entry.jsx`,
  output: {
    path: `${__dirname}/build`,
    filename: '[hash].js',
  },
  devtool: production ? undefined : 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        loader: ExtractText.extract(['css-loader', 'sass-loader']),
      },
    ],
  },
};
