import path from 'path';

import sinon from 'sinon';
import ts from 'typescript';
import { expect } from 'chai';

import { determineBuildModeEnabled, overrideOptions, retrieveReferencedProjects, guardTSVersion } from '../../src/tsconfig-helpers';

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
          overrideOptions({ config: { compilerOptions: { allowUnreachableCode: false, noUnusedLocals: true, noUnusedParameters: true } } }, false)
        ).compilerOptions
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
        declaration: false,
        declarationMap: false,
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
                  declaration: true,
                  declarationMap: false,
                },
              },
            },
            false
          )
        ).compilerOptions
      ).deep.include({
        noEmit: true,
        incremental: false,
        composite: false,
        declaration: false,
        declarationMap: false,
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
                  declarationMap: false,
                  declarationDir: '.',
                },
              },
            },
            false
          )
        ).compilerOptions
      ).deep.include({
        noEmit: true,
        incremental: false,
        composite: false,
        declaration: false,
        declarationMap: false,
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
                  declaration: true,
                  declarationMap: false,
                  declarationDir: '',
                },
              },
            },
            false
          )
        ).compilerOptions
      ).deep.include({
        noEmit: true,
        incremental: false,
        composite: false,
        declaration: false,
        declarationMap: false,
      });
    });

    it('should set --emitDeclarationOnly options when `--build` mode is on', () => {
      expect(JSON.parse(overrideOptions({ config: {} }, true)).compilerOptions).deep.include({
        emitDeclarationOnly: true,
        noEmit: false,
        declarationMap: false,
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
            true
          )
        ).compilerOptions
      ).deep.include({
        emitDeclarationOnly: true,
        noEmit: false,
        declarationMap: false,
      });
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
    it('should throw if typescript@2.5.0', () => {
      sinon.stub(ts, 'version').value('3.5.0');
      expect(guardTSVersion).throws('@stryker-mutator/typescript-checker only supports typescript@3.6 our higher. Found typescript@3.5.0');
    });
    it('should not throw if typescript@3.6.0', () => {
      sinon.stub(ts, 'version').value('3.6.0');
      expect(guardTSVersion).not.throws();
    });
    it('should not throw if typescript@4.0.0', () => {
      sinon.stub(ts, 'version').value('4.0.0');
      expect(guardTSVersion).not.throws();
    });
  });
});
