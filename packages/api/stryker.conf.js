const { execSync } = require('child_process');
const path = require('path');
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.dashboard.module = moduleName;

// Add src-generated to the files list, since it isn't in git
const files = execSync('git ls-files --others --exclude-standard --cached --exclude .stryker-tmp')
  .toString()
  .split('\n')
  .map(file => file.trim())
  .filter(Boolean);
files.push('src-generated/**/*.*');
settings.files = files;
module.exports = settings;
