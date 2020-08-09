const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.dashboard = { module: moduleName };
settings.sandboxFileHeaders = {
  '+(src|test)/**/*.ts': '// @ts-nocheck\n'
}
delete settings.files;
module.exports = settings;
