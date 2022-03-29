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
});
