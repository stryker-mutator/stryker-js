import path from 'path';

import sinon from 'sinon';
import ts from 'typescript';
import { expect } from 'chai';

import {
  determineBuildModeEnabled,
  overrideOptions,
  retrieveReferencedProjects,
  guardTSVersion,
  getSourceMappingURL,
} from '../../src/tsconfig-helpers.js';

describe('typescript-helpers', () => {
  describe(determineBuildModeEnabled.name, () => {
    let readFileStub: sinon.SinonStub;

    beforeEach(() => {
      readFileStub = sinon.stub(ts.sys, 'readFile');
    });

    it('should throw an error if the tsconfig file could not be found', () => {
      expect(() => determineBuildModeEnabled('tsconfig.json')).throws('File "tsconfig.json" not found');
    });

    it('should return true if the tsconfig file has references', () => {
      readFileStub.returns('{ "references": [] }');
      expect(determineBuildModeEnabled('foo.json')).true;
      expect(readFileStub).calledWith('foo.json');
    });

    it('should return true if the tsconfig file has no references', () => {
      readFileStub.returns('{ "compilerOptions": {} }');
      expect(determineBuildModeEnabled('foo.json')).false;
    });
  });

  describe(overrideOptions.name, () => {
    it('should allow unreachable and unused code', () => {
      expect(JSON.parse(overrideOptions({ config: {} }, false)).compilerOptions).deep.include({
        allowUnreachableCode: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
      });
      expect(
        JSON.parse(
          overrideOptions({ config: { compilerOptions: { allowUnreachableCode: false, noUnusedLocals: true, noUnusedParameters: true } } }, false),
        ).compilerOptions,
      ).deep.include({
        allowUnreachableCode: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
      });
    });

    it('should set --noEmit options when `--build` mode is off', () => {
      expect(JSON.parse(overrideOptions({ config: {} }, false)).compilerOptions).deep.include({
        noEmit: true,
        incremental: false,
        composite: false,
      });
      expect(
        JSON.parse(
          overrideOptions(
            {
              config: {
                compilerOptions: {
                  noEmit: false,
                  incremental: true,
                  composite: true,
                },
              },
            },
            false,
          ),
        ).compilerOptions,
      ).deep.include({
        noEmit: true,
        incremental: false,
        composite: false,
      });
    });

    it('should remove --declarationDir options when `--build` mode is off', () => {
      expect(
        JSON.parse(
          overrideOptions(
            {
              config: {
                compilerOptions: {
                  noEmit: false,
                  incremental: true,
                  composite: true,
                  declaration: true,
                  declarationMap: true,
                  declarationDir: '.',
                },
              },
            },
            false,
          ),
        ).compilerOptions,
      ).not.property('declarationDir');
      expect(
        JSON.parse(
          overrideOptions(
            {
              config: {
                compilerOptions: {
                  noEmit: false,
                  incremental: true,
                  composite: true,
                  declaration: true,
                  declarationMap: true,
                  declarationDir: '',
                },
              },
            },
            false,
          ),
        ).compilerOptions,
      ).not.property('declarationDir');
    });

    it('should set --emitDeclarationOnly options when `--build` mode is on', () => {
      expect(JSON.parse(overrideOptions({ config: {} }, true)).compilerOptions).deep.include({
        emitDeclarationOnly: true,
        noEmit: false,
        declarationMap: true,
      });
      expect(
        JSON.parse(
          overrideOptions(
            {
              config: {
                compilerOptions: {
                  emitDeclarationOnly: false,
                  noEmit: true,
                  declarationMap: true,
                },
              },
            },
            true,
          ),
        ).compilerOptions,
      ).deep.include({
        emitDeclarationOnly: true,
        noEmit: false,
        declarationMap: true,
      });
    });

    it('should set --declarationMap and --declaration options when `--build` mode is on', () => {
      expect(JSON.parse(overrideOptions({ config: { declarationMap: false, declaration: false } }, true)).compilerOptions).deep.include({
        declarationMap: true,
        declaration: true,
      });
    });

    it('should delete declarations properties if `--build` mode is on', () => {
      expect(
        JSON.parse(
          overrideOptions(
            {
              config: {
                compilerOptions: {
                  inlineSourceMap: '.',
                  inlineSources: '.',
                  mapRoute: '.',
                  sourceRoot: '.',
                  outFile: '.',
                },
              },
            },
            true,
          ),
        ).compilerOptions,
      ).to.not.have.any.keys('inlineSourceMap', 'inlineSources', 'mapRoute', 'sourceRoot', 'outFile');
    });
  });

  describe(retrieveReferencedProjects.name, () => {
    it('should result in an empty array when references are missing', () => {
      expect(retrieveReferencedProjects({ config: { compilerOptions: {} } }, '')).deep.eq([]);
    });

    it('should retrieve referenced projects', () => {
      expect(retrieveReferencedProjects({ config: { references: [{ path: 'some.json' }] } }, process.cwd())).deep.eq([path.resolve('some.json')]);
    });

    it('should resolve from given dirname', () => {
      expect(retrieveReferencedProjects({ config: { references: [{ path: 'some.json' }] } }, 'a/b')).deep.eq([path.resolve('a', 'b', 'some.json')]);
    });
  });

  describe(guardTSVersion.name, () => {
    it('should throw if typescript@3.5.0', () => {
      expect(guardTSVersion.bind(undefined, '3.5.0')).throws(
        '@stryker-mutator/typescript-checker only supports typescript@3.6 or higher. Found typescript@3.5.0',
      );
    });
    it('should throw if typescript@3.5.0-beta', () => {
      expect(guardTSVersion.bind(undefined, '3.5.0-beta')).throws(
        '@stryker-mutator/typescript-checker only supports typescript@3.6 or higher. Found typescript@3.5.0-beta',
      );
    });
    it('should not throw if typescript@3.6.0', () => {
      expect(guardTSVersion.bind(undefined, '3.6.0')).not.throws();
    });
    it('should not throw if typescript@4.0.0', () => {
      expect(guardTSVersion.bind(undefined, '4.0.0')).not.throws();
    });
    it('should not throw if typescript@5.4.0-beta', () => {
      expect(guardTSVersion.bind(undefined, '5.4.0-beta')).not.throws();
    });
  });

  describe(getSourceMappingURL.name, () => {
    it('should return undefined when no sourceMap is provided', () => {
      const content = 'let sum = 2 + 6;';
      const result = getSourceMappingURL(content);
      expect(result).to.be.undefined;
    });

    it('should be able to get multiple sourceFiles in sequence', () => {
      const content = '//# sourceMappingURL=/url.ts';
      const result1 = getSourceMappingURL(content);
      const result2 = getSourceMappingURL(content);
      expect(result1).to.be.eq('/url.ts');
      expect(result2).to.be.eq('/url.ts');
    });

    it('should not hit when sourceMappingURL is not on the end of the file', () => {
      const content = `const regex = //# sourceMappingURL=/url.ts
                       console.log(regex);`;
      const result = getSourceMappingURL(content);
      expect(result).to.be.undefined;
    });
  });
});
