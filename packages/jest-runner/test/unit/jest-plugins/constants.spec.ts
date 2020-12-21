import { expect } from 'chai';

import * as constants from '../../../src/jest-plugins/constants';

describe('jest-plugins constants', () => {
  ([
    ['globalNamespaceIdentifier', '__strykerGlobalNamespace__'],
    ['namespaceAlternative', '__stryker2__'],
    ['coverageAnalysis', '__strykerCoverageAnalysis__'],
  ] as const).forEach(([name, value]) => {
    it(`should expect ${name} = ${value}`, () => {
      expect(constants[name]).eq(value);
    });
  });
});
