import { ListByPackage, LocalInstaller, progress } from 'install-local';
import fs from 'fs';
import glob = require('glob');
import path = require('path');

console.log('starting installation of local dependencies');

function globAsPromised(pattern: string, options: glob.IOptions) {
  return new Promise<string[]>((res, rej) => {
    glob(pattern, options, (err, matches) => {
      if (err) {
        rej(err);
      } else {
        res(matches);
      }
    });
  });
}

function readFile(fileName: string) {
  return new Promise<string>((res, rej) => fs.readFile(fileName, 'utf8', (err, content) => {
    if (err) {
      rej(err);
    } else {
      res(content);
    }
  }));
}

interface Package {
  localDependencies?: { [name: string]: string };
}

/**
 * Installs local dependencies in one go,
 * reads the package.json files and installs the local dependencies marked there.
 * The packageJsonGlobs default to ./package.json and test/* /package.json files 
 * @param directory the directory where the tests live
 */
export async function bootstrapLocalDependencies(directory: string, packageJsonGlobs = ['package.json', 'test/*/package.json']) {
  console.log(`bootstrap ${path.resolve(directory)} (using ${packageJsonGlobs.join(',')})`);
  const files = (await Promise.all(packageJsonGlobs.map((globPattern) => globAsPromised(globPattern, { cwd: path.resolve(directory) })))).flat();
  const packages = await Promise.all(files.map(fileName => readFile(fileName)
    .then(content => ({ dir: path.dirname(fileName), content: JSON.parse(content) as Package }))));
  const sourcesByTarget: ListByPackage = {};
  for (const pkg of packages) {
    const localDeps = pkg.content.localDependencies;
    if (localDeps) {
      sourcesByTarget[path.resolve(pkg.dir)] = Object.keys(localDeps).map(key => path.resolve(pkg.dir, localDeps[key]));
    }
  }
  const localInstaller = new LocalInstaller(sourcesByTarget);
  progress(localInstaller);
  await localInstaller.install();
}
