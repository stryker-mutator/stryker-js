const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.plugins = settings.plugins.map(p => path.resolve(p));
settings.dashboard.module = moduleName;
settings.checkers = [];
module.exports = settings;
