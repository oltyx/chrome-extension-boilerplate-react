// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var config = require('../webpack.config');
var ZipPlugin = require('zip-webpack-plugin');

delete config.chromeExtensionBoilerplate;

config.mode = 'production';

try {
  var packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'package.json'), 'utf-8'));
} catch (error) {
  console.error('Failed to read package.json:', error);
  process.exit(1);
}

config.plugins = (config.plugins || []).concat(
  new ZipPlugin({
    filename: `${packageInfo.name}-${packageInfo.version}.zip`,
    path: path.join(__dirname, '../', 'zip'),
  })
);

webpack(config, function (err, stats) {
  if (err) {
    console.error('Webpack encountered errors:', err);
    process.exit(1);
  }
  if (stats.hasErrors()) {
    console.error('Webpack compilation errors:', stats.toJson().errors);
    process.exit(1);
  }
  console.log('Webpack compilation completed successfully');
});
