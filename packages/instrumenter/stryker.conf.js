const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
delete settings.mochaOptions.spec;
delete settings.files;
settings.plugins = settings.plugins.map(p => path.resolve(p));
settings.dashboard.module = moduleName;
module.exports = settings;
