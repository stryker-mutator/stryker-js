const path = require('path');
const { execSync } = require('child_process');

/**
 * Ripped from @actions/core
 * @param {string} name name of the input to retrieeve
 * @param {any} options 
 */
function getInput(name, options) {
  const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
  if (options && options.required && !val) {
      throw new Error(`Input required and not supplied: ${name}`);
  }
  return val.trim();
}

const package = getInput('package');
const apiKey = getInput('apiKey');
console.log('Package ', package);

execSync('npm install', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });
execSync('npm run stryker', { stdio: 'inherit', env: { STRYKER_DASHBOARD_API_KEY: apiKey },  cwd: path.resolve(__dirname, '..', '..', '..', 'packages', package)});
