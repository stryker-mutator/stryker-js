import { ListByPackage, LocalInstaller, progress } from 'install-local';
import { fs } from 'mz';
import glob = require('glob');
import path = require('path');

function globAsPromised(pattern: string) {
  return new Promise<string[]>((res, rej) => {
    glob(pattern, { cwd: path.resolve(__dirname, '..') }, (err, matches) => {
      if (err) {
        rej(err);
      } else {
        res(matches);
      }
    });
  });
}

interface Package {
  localDependencies?: { [name: string]: string };
}

async function bootstrapLocalDependencies() {
  const files = await globAsPromised('{package.json,test/*/package.json}');
  const packages = await Promise.all(files.map(fileName => fs.readFile(fileName, 'utf8')
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

bootstrapLocalDependencies()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
