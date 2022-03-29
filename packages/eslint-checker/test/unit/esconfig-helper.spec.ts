import path from 'path';
import { fileURLToPath } from 'url';

import { expect } from 'chai';

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

  it('should default some rules', async () => {
    const config = await getConfig();

    expect(config).has.deep.property('rules', {
      'import/no-unresolved': 'off',
    });
  });

  it('should support .cjs config files', async () => {
    const filename = resolveTestResource('.eslintrc.cjs');
    const config = await getConfig(filename);
    expect(config).has.deep.property('ignorePatterns', ['src/**/*.test.ts', 'src/frontend/generated/*']);
  });
});
