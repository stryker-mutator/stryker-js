// @ts-check
import fs from 'fs/promises';

import { glob } from 'glob';
import { satisfies } from 'semver';

const packageConfigFiles = await glob('packages/*/package.json', {
  cwd: new URL('..', import.meta.url),
});

const packages = await Promise.all(
  packageConfigFiles.map(async (name) => {
    const fileUrl = new URL(`../${name}`, import.meta.url);
    /** @type {{peerDependencies?: Object.<string, string | undefined>}} */
    const content = JSON.parse(await fs.readFile(fileUrl, 'utf-8'));
    return { name, fileUrl, content };
  }),
);
/**
 * @type {{version: string}}
 */
const { version } = JSON.parse(
  await fs.readFile(new URL('../lerna.json', import.meta.url), 'utf-8'),
);
const newVersion = `~${version}`;
await Promise.all(
  packages.map(async ({ name, content, fileUrl }) => {
    if (content.peerDependencies) {
      const strykerCoreVersion =
        content.peerDependencies['@stryker-mutator/core'];
      if (strykerCoreVersion) {
        if (!satisfies(version, strykerCoreVersion)) {
          content.peerDependencies['@stryker-mutator/core'] = newVersion;
          await fs.writeFile(fileUrl, `${JSON.stringify(content, null, 2)}\n`);
          console.log(
            `✅ Updated ${name} (peer dep "@stryker-mutator/core": "${newVersion}")`,
          );
        }
      }
    }
  }),
);
