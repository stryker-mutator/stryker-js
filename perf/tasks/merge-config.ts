import { promises as fs } from 'fs';
import path = require('path');

const testRootDir = path.resolve(__dirname, '..', 'test');
const configRootDir = path.resolve(__dirname, '..', 'config');

mergeConfiguration().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function mergeConfiguration() {
  const testDirs = (await fs.readdir(testRootDir, { withFileTypes: true })).filter((testDir) => testDir.isDirectory());
  for await (const testDir of testDirs) {
    const configOverrideDir = path.resolve(configRootDir, testDir.name);
    try {
      const configDir = await fs.stat(configOverrideDir);
      if (configDir.isDirectory()) {
        const overridePackageFileName = path.resolve(configOverrideDir, 'package.json');
        const overrideStrykerConfigFileName = path.resolve(configOverrideDir, 'stryker.conf.json');
        try {
          const overrides = require(overridePackageFileName);
          const original = require(path.resolve(testRootDir, testDir.name, 'package.json'));
          await fs.writeFile(path.resolve(testRootDir, testDir.name, 'package.json'), JSON.stringify({ ...original, ...overrides }, null, 2));
        } catch {
          console.log(`Note: no overrides found at ${overridePackageFileName}`);
        }
        try {
          await fs.copyFile(overrideStrykerConfigFileName, path.resolve(testRootDir, testDir.name, 'stryker.conf.json'));
        } catch {
          console.log(`Note: no stryker.conf.json file ${overrideStrykerConfigFileName}`);
        }
      }
      console.log(`✅ Merged config for ${testDir.name}`);
    } catch {
      console.log(`Note: no config override directory found at ${configOverrideDir}`);
    }
  }
}
