var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/Main',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  module: {
    loaders: [
    ]
  }
}
