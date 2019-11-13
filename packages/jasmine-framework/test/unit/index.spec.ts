import { expect } from 'chai';

import { strykerPlugins } from '../..';
import JasmineTestFramework from '../../src/JasmineTestFramework';

describe('index', () => {
  it('should export strykerPlugins', () => {
    expect(strykerPlugins[0].injectableClass).eq(JasmineTestFramework);
  });
});
