const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.dashboard.module = moduleName;
settings.coverageAnalysis = 'off';
module.exports = function (config) {
  config.set(settings);
};
