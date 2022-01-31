const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = path.dirname(fileURLToPath(import.meta.url)).split(path.sep).pop();
settings.plugins = settings.plugins.map(p => path.resolve(p));
settings.mochaOptions.spec = ['dist/test/**/*.js'];
settings.dashboard.module = moduleName;
module.exports = settings;
