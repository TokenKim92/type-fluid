const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production'; //prettier-ignore
const FILENAME = pkg.name + (isProduction ? '.min' : '');
const BANNER = [
  'Name: ' + pkg.name + ' | ' + pkg.description,
  'Version: ' + pkg.version + ' | ' + new Date().toDateString(),
  'Author: ' + pkg.author,
  'License: ' + pkg.license,
  'Url: ' + pkg.homepage,
].join('\n');

const config = {
  entry: './src/TypeFluid.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: FILENAME + '.js',
    library: ['TypeFluid'],
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  devtool: 'eval',
  plugins: [
    new webpack.BannerPlugin({
      banner: BANNER,
      entryOnly: true,
    }),
  ],
};

module.exports = config;
