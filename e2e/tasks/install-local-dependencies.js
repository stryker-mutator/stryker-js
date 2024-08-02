import { fileURLToPath, URL } from 'url';

import { bootstrapLocalDependencies } from '../../helpers/bootstrap-local-dependencies.js';

/**
 * Installs the Stryker dependencies inside the correct test packages (using "localDependencies")
 * Install a single e2e test package is possible with `npm run install-local-dependencies -- path/to/package.json path/to/other/package.json`
 * Example: `npm run install-local-dependencies -- test/jest-with-ts/package.json`
 */
const globs = process.argv.slice(2);
bootstrapLocalDependencies(fileURLToPath(new URL('..', import.meta.url)), globs.length ? globs : undefined)
  .then(() => console.log('Installed local dependencies'))
  .catch((/** @type {unknown}*/ err) => console.error(err));
