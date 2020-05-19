const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.dashboard.module = moduleName;
delete settings.mochaOptions.spec;
delete settings.files;
settings.coverageAnalysis = 'off';
module.exports = settings;
