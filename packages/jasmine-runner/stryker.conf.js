const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.plugins = settings.plugins.map(p => path.resolve(p));
settings.dashboard.module = moduleName;
settings.files = ['{src-generated,src,test,schema,testResources,typings}/**/*.{ts,json}', '*.{ts,json}'];
settings.mutate = ['src/**/!(*d).ts'];
module.exports = settings;
