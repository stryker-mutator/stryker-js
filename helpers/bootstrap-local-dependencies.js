// @ts-check
import { LocalInstaller, progress } from 'install-local';
import fs from 'fs';
import path from 'path';

import { glob } from 'glob';

console.log('starting installation of local dependencies');

/**
 * @typedef Package
 * @property {{ [name: string]: string }} localDependencies

/**
 * Installs local dependencies in one go,
 * reads the package.json files and installs the local dependencies marked there.
 * The packageJsonGlobs default to ./package.json and test/* /package.json files 
 * @param {string} directory
 * @param {string[]} packageJsonGlobs
 * @returns {Promise<void>}
 */
export async function bootstrapLocalDependencies(directory, packageJsonGlobs = ['package.json', 'test/*/package.json']) {
  console.log(`bootstrap ${path.resolve(directory)} (using ${packageJsonGlobs.join(',')})`);
  const files = (await Promise.all(packageJsonGlobs.map((globPattern) => glob(globPattern, { cwd: path.resolve(directory) })))).flat();
  const packages = await Promise.all(
    files.map((fileName) =>
      fs.promises.readFile(fileName, 'utf-8').then((rawContent) => {
        /**
         * @type {Package}
         */
        const content = JSON.parse(rawContent);
        return { dir: path.dirname(fileName), content };
      })
    )
  );
  /**
   * @type {import('install-local').ListByPackage}
   */
  const sourcesByTarget = {};
  for (const pkg of packages) {
    const localDeps = pkg.content.localDependencies;
    if (localDeps) {
      sourcesByTarget[path.resolve(pkg.dir)] = Object.keys(localDeps).map((key) => path.resolve(pkg.dir, localDeps[key]));
    }
  }
  const localInstaller = new LocalInstaller(sourcesByTarget);
  progress(localInstaller);
  await localInstaller.install();
}
