import { File } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import * as semver from 'semver';
import sinon from 'sinon';
import * as ts from 'typescript';

import * as tsHelpers from '../../../src/helpers/tsHelpers';

describe('tsHelpers', () => {
  let satisfiesStub: sinon.SinonStub;

  beforeEach(() => {
    satisfiesStub = sinon.stub(semver, 'satisfies');
  });

  describe('guardTypescriptVersion', () => {
    it('should throw an error when installed typescript version does not satisfy >=2.4', () => {
      satisfiesStub.returns(false);
      expect(() => tsHelpers.guardTypescriptVersion()).throws(
        `Installed typescript version ${ts.version} is not supported by stryker-typescript. Please install version 2.5 or higher (\`npm install typescript@^2.5\`).`
      );
      expect(satisfiesStub).calledWith(ts.version, '>=2.4');
    });

    it('should not throw an error if installed version satisfies >=2.4', () => {
      satisfiesStub.returns(true);
      expect(() => tsHelpers.guardTypescriptVersion()).not.throws();
    });
  });

  describe('parseFile', () => {
    it('should also set parent nodes', () => {
      const input = new File('file.ts', 'const b: string = "hello world";');
      const actual = tsHelpers.parseFile(input, undefined);
      ts.forEachChild(actual, node => {
        expect(node.parent).ok;
      });
    });
  });
});
