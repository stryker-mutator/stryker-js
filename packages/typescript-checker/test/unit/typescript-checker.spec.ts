import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { strykerReportBugUrl } from '@stryker-mutator/util';
import ts from 'typescript';
import { CheckStatus, type CheckResult } from '@stryker-mutator/api/check';

import { TypescriptChecker } from '../../src/typescript-checker.js';
import type { TypescriptCheckerOptionsWithStrykerOptions } from '../../src/typescript-checker-options-with-stryker-options.js';
import { TypescriptCompiler } from '../../src/typescript-compiler.js';
import { TSFileNode } from '../../src/grouping/ts-file-node.js';
import * as pluginTokens from '../../src/plugin-tokens.js';
import { createTSDiagnostic } from '../helpers.js';

function reasonFor(result: Record<string, CheckResult>, id: string): string {
  const checkResult = result[id];
  if (checkResult.status !== CheckStatus.CompileError) {
    throw new Error(`Expected mutant ${id} to be a compile error`);
  }
  return checkResult.reason;
}

describe(TypescriptChecker.name, () => {
  let sut: TypescriptChecker;
  let compilerMock: sinon.SinonStubbedInstance<TypescriptCompiler>;
  let options: TypescriptCheckerOptionsWithStrykerOptions;
  let nodes: Map<string, TSFileNode>;
  beforeEach(() => {
    nodes = new Map();
    options =
      testInjector.options as TypescriptCheckerOptionsWithStrykerOptions;
    options.typescriptChecker = {
      prioritizePerformanceOverAccuracy: true,
      experimentalNativePreview: false,
    };
    compilerMock = sinon.createStubInstance(TypescriptCompiler);
    sinon.stub(compilerMock, 'nodes').get(() => nodes);
    sut = testInjector.injector
      .provideValue(pluginTokens.tsCompiler, compilerMock)
      .injectClass(TypescriptChecker);
  });

  describe(TypescriptChecker.prototype.group.name, () => {
    it('should not group mutants if prioritizePerformanceOverAccuracy is false', async () => {
      options.typescriptChecker.prioritizePerformanceOverAccuracy = false;
      const result = await sut.group([
        factory.mutant({ id: '1' }),
        factory.mutant({ id: '2' }),
        factory.mutant({ id: '3' }),
      ]);
      expect(result).lengthOf(3);
      expect(result.reduce((prev, group) => prev + group.length, 0)).eq(3);
    });

    it('should group mutants if prioritizePerformanceOverAccuracy is true', async () => {
      options.typescriptChecker.prioritizePerformanceOverAccuracy = true;
      const result = await sut.group([
        factory.mutant(),
        factory.mutant(),
        factory.mutant(),
      ]);
      expect(result).lengthOf(1);
    });

    it('should not add an empty group when there are no mutants that fall outside of the project', async () => {
      const mutants = [factory.mutant({ fileName: 'foo.ts', id: '41' })];
      compilerMock.nodes.set('foo.ts', new TSFileNode('foo.ts', [], []));

      const result = await sut.group(mutants);
      expect(result).lengthOf(1);
      expect(result[0]).lengthOf(1);
    });
  });

  describe(TypescriptChecker.prototype.check.name, () => {
    it('should throw when init detects typescript errors', async () => {
      compilerMock.init.resolves([
        createTSDiagnostic({ messageText: 'fooError' }),
      ]);

      await expect(sut.init()).rejectedWith(
        'Typescript error(s) found in dry run compilation:',
      );
    });

    it('should initialize successfully when no typescript errors exist', async () => {
      compilerMock.init.resolves([]);

      await expect(sut.init()).fulfilled;
    });

    it('should pass all mutants when group is outside of project', async () => {
      const result = await sut.check([
        factory.mutant({ fileName: 'outside.ts', id: '41' }),
        factory.mutant({ fileName: 'outside.ts', id: '42' }),
      ]);

      expect(result['41'].status).eq(CheckStatus.Passed);
      expect(result['42'].status).eq(CheckStatus.Passed);
      expect(compilerMock.check).not.called;
    });

    it('should mark related mutants as compile errors', async () => {
      const mutant = factory.mutant({ fileName: 'foo.ts', id: '41' });
      compilerMock.nodes.set('foo.ts', new TSFileNode('foo.ts', [], []));
      compilerMock.check.resolves([
        createTSDiagnostic({
          file: ts.createSourceFile(
            'foo.ts',
            '',
            ts.ScriptTarget.Latest,
            false,
            undefined,
          ),
          start: 0,
          length: 1,
          messageText: 'fooError',
        }),
      ]);

      const result = await sut.check([mutant]);

      expect(result['41'].status).eq(CheckStatus.CompileError);
      expect(reasonFor(result, '41')).contains('fooError');
    });

    it('should append multiple errors to the same mutant', async () => {
      const mutants = [
        factory.mutant({ fileName: 'foo.ts', id: '41' }),
        factory.mutant({ fileName: 'bar.ts', id: '42' }),
      ];
      compilerMock.nodes.set('foo.ts', new TSFileNode('foo.ts', [], []));
      compilerMock.check.resolves([
        createTSDiagnostic({
          file: ts.createSourceFile(
            'foo.ts',
            '',
            ts.ScriptTarget.Latest,
            false,
            undefined,
          ),
          start: 0,
          length: 1,
          messageText: 'firstError',
        }),
        createTSDiagnostic({
          file: ts.createSourceFile(
            'foo.ts',
            '',
            ts.ScriptTarget.Latest,
            false,
            undefined,
          ),
          start: 0,
          length: 1,
          messageText: 'secondError',
        }),
      ]);

      const result = await sut.check(mutants);

      expect(result['41'].status).eq(CheckStatus.CompileError);
      expect(reasonFor(result, '41')).contains('firstError');
      expect(reasonFor(result, '41')).contains('secondError');
      expect(result['42'].status).eq(CheckStatus.Passed);
    });

    it('should re-check ambiguous grouped mutants individually and skip already mapped mutant ids', async () => {
      const firstMutant = factory.mutant({ fileName: 'foo.ts', id: '41' });
      const secondMutant = factory.mutant({ fileName: 'bar.ts', id: '42' });
      const node = {
        getMutantsWithReferenceToChildrenOrSelf: sinon.stub(),
      } as unknown as TSFileNode;
      const nodeGetMutants =
        node.getMutantsWithReferenceToChildrenOrSelf as sinon.SinonStub;
      nodeGetMutants.onFirstCall().returns([firstMutant]);
      nodeGetMutants.onSecondCall().returns([firstMutant, secondMutant]);
      nodes.set('foo.ts', node);

      compilerMock.check.onFirstCall().resolves([
        createTSDiagnostic({
          file: ts.createSourceFile(
            'foo.ts',
            '',
            ts.ScriptTarget.Latest,
            false,
            undefined,
          ),
          start: 0,
          length: 1,
          messageText: 'firstError',
        }),
        createTSDiagnostic({
          file: ts.createSourceFile(
            'foo.ts',
            '',
            ts.ScriptTarget.Latest,
            false,
            undefined,
          ),
          start: 0,
          length: 1,
          messageText: 'ambiguousError',
        }),
      ]);
      compilerMock.check.onSecondCall().resolves([]);
      compilerMock.check.onThirdCall().resolves([
        createTSDiagnostic({
          file: ts.createSourceFile(
            'foo.ts',
            '',
            ts.ScriptTarget.Latest,
            false,
            undefined,
          ),
          start: 0,
          length: 1,
          messageText: 'secondMutantError',
        }),
      ]);

      const result = await sut.check([firstMutant, secondMutant]);

      expect(compilerMock.check).callCount(3);
      expect(compilerMock.check.secondCall).calledWithExactly([]);
      expect(compilerMock.check.thirdCall).calledWithExactly([secondMutant]);
      expect(result['41'].status).eq(CheckStatus.CompileError);
      expect(result['42'].status).eq(CheckStatus.CompileError);
      expect(reasonFor(result, '42')).contains('secondMutantError');
    });

    it("should reject when errors don't provide a file name", async () => {
      // Arrange
      const mutants = [
        factory.mutant({ fileName: 'foo.ts', id: '41' }),
        factory.mutant({ fileName: 'bar.js', id: '42' }),
      ];
      compilerMock.nodes.set('foo.ts', new TSFileNode('foo.ts', [], []));
      compilerMock.check.resolves([
        createTSDiagnostic({ file: undefined, messageText: 'fooError' }),
      ]);

      // Act
      await expect(sut.check(mutants)).rejectedWith(
        `Typescript error: 'fooError' was reported without a corresponding file. This shouldn't happen. Please open an issue using this link: ${strykerReportBugUrl(
          '[BUG]: TypeScript checker reports compile error without a corresponding file: fooError',
        )}`,
      );
    });
    it('should reject when errors relate to an unrelated file', async () => {
      // Arrange
      const mutants = [
        factory.mutant({ fileName: 'foo.ts', id: '41' }),
        factory.mutant({ fileName: 'foo.ts', id: '42' }),
      ];
      compilerMock.nodes.set('foo.ts', new TSFileNode('foo.ts', [], []));
      compilerMock.check.resolves([
        createTSDiagnostic({
          file: ts.createSourceFile(
            'bar.ts',
            '',
            ts.ScriptTarget.Latest,
            false,
            undefined,
          ),
          messageText: 'fooError',
        }),
      ]);

      // Act
      await expect(sut.check(mutants)).rejectedWith(
        `Typescript error: 'fooError' was reported in an unrelated file (bar.ts). This file is not part of your project, or referenced from your project. This shouldn't happen, please open an issue using this link: ${strykerReportBugUrl(
          '[BUG]: TypeScript checker reports compile error in an unrelated file: fooError',
        )}`,
      );
    });
  });
});
