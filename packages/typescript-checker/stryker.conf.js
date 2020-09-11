const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.plugins = settings.plugins.map(p => path.resolve(p));
settings.mochaOptions.spec = ['test/unit/**/*.js']
settings.dashboard.module = moduleName;
module.exports = settings;
