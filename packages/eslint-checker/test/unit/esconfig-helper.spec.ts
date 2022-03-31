import path from 'path';
import { fileURLToPath } from 'url';

import { expect } from 'chai';
import { cosmiconfig } from 'cosmiconfig';

import { getConfig } from '../../src/esconfig-helpers.js';

describe('adjustConfigFile', () => {
  const resolveTestResource = path.resolve.bind(
    path,
    path.dirname(fileURLToPath(import.meta.url)),
    '..' /* unit */,
    '..' /* test */,
    '..' /* dist */,
    'testResources',
    'unit'
  ) as unknown as typeof path.resolve;

  const defaultLoader = cosmiconfig('eslint');

  it('should default some rules', async () => {
    const config = await getConfig(defaultLoader);

    expect(config).has.deep.property('rules', {
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    });
  });

  it('should support .cjs config files', async () => {
    const filename = resolveTestResource('.eslintrc.cjs');
    const config = await getConfig(defaultLoader, filename);
    expect(config).has.deep.property('ignorePatterns', ['src/**/*.test.ts', 'src/frontend/generated/*']);
  });

  it('should support .yaml config files', async () => {
    const filename = resolveTestResource('.eslintrc.yaml');
    const config = await getConfig(defaultLoader, filename);
    expect(config).has.deep.property('ignorePatterns', ['src/**/*.test.ts', 'src/frontend/generated/*']);
  });

  it('should support a renamed .cjs config file', async () => {
    const filename = resolveTestResource('lint-config.cjs');
    const config = await getConfig(defaultLoader, filename);
    expect(config).has.deep.property('ignorePatterns', ['src/**/*.test.ts', 'src/frontend/generated/*']);
  });

  it('should throw an error if it cannot find the file', async () => {
    await expect(getConfig(defaultLoader, 'foo')).rejectedWith('no such file');
  });

  it('should handle null', async () => {
    // Not sure in what instance cosmiconfig().load() returns null, but the Types suggest it can
    const nullLoader = {
      load: async () => null,
    };
    const filename = resolveTestResource('null.cjs');
    await expect(getConfig(nullLoader, filename)).rejectedWith('appears to be null');
  });

  it('should remove any plugins specified in the config files', async () => {
    // these make the linter throw errors like:
    //  Failed to load plugin '@typescript-eslint' declared in 'CLIOptions': The argument 'filename' must be a file URL object, file URL string, or absolute path string. Received ''
    //  However it appears to be working and loads the plugins correctly. There should not be a discrepency between the project and stryker settings regarding plugins in either case.
    const filename = resolveTestResource('.eslintrc-with-plugins.cjs');
    const config = await getConfig(defaultLoader, filename);
    expect(config).not.to.have.property('plugins');
  });

  it('should remove any extends specified in the config files', async () => {
    // these make the linter throw errors like:
    //  Failed to load plugin '@typescript-eslint' declared in 'CLIOptions': The argument 'filename' must be a file URL object, file URL string, or absolute path string. Received ''
    //  However it appears to be working and loads the plugins correctly.
    const filename = resolveTestResource('.eslintrc-with-extends.cjs');
    const config = await getConfig(defaultLoader, filename);
    expect(config).not.to.have.property('extends');
  });
});
