import { promises as fsPromises } from 'fs';
import { URL } from 'url';

const testRootDirUrl = new URL('../test', import.meta.url);
const configRootDir = new URL('../config', import.meta.url);

mergeConfiguration().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function mergeConfiguration() {
  const testDirs = (await fsPromises.readdir(testRootDirUrl, { withFileTypes: true })).filter((testDir) => testDir.isDirectory());
  for await (const testDir of testDirs) {
    const configOverrideDirUrl = new URL(testDir.name, `${configRootDir}/`);
    try {
      const configDir = await fsPromises.stat(configOverrideDirUrl);
      if (configDir.isDirectory()) {
        const overridePackageFileUrl = new URL('package.json', `${configOverrideDirUrl}/`);
        const overrideStrykerConfigFileUrl = new URL('stryker.conf.json', `${configOverrideDirUrl}/`);
        const originalPackageJsonFileUrl = new URL(`${testDir.name}/package.json`, `${testRootDirUrl}/`);
        const strykerConfigFileUrl = new URL(`${testDir.name}/stryker.conf.json`, `${testRootDirUrl}/`);
        try {
          const overrides = JSON.parse(await fsPromises.readFile(overridePackageFileUrl, 'utf-8'));
          const original = JSON.parse(await fsPromises.readFile(originalPackageJsonFileUrl, 'utf-8'));
          await fsPromises.writeFile(originalPackageJsonFileUrl, JSON.stringify({ ...original, ...overrides }, null, 2));
        } catch (err) {
          console.log(`Note: no overrides found at ${overridePackageFileUrl}`);
        }
        try {
          await fsPromises.copyFile(overrideStrykerConfigFileUrl, strykerConfigFileUrl);
        } catch {
          console.log(`Note: no stryker.conf.json file ${overrideStrykerConfigFileUrl}`);
        }
      }
      console.log(`✅ Merged config for ${testDir.name}`);
    } catch {
      console.log(`Note: no config override directory found at ${configOverrideDirUrl}`);
    }
  }
}
