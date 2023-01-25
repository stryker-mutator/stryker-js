import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { strykerReportBugUrl } from '@stryker-mutator/util';
import ts from 'typescript';

import { TypescriptChecker } from '../../src/typescript-checker.js';
import { TypescriptCheckerOptionsWithStrykerOptions } from '../../src/typescript-checker-options-with-stryker-options';
import { TypescriptCompiler } from '../../src/typescript-compiler.js';
import { TSFileNode } from '../../src/grouping/ts-file-node.js';
import * as pluginTokens from '../../src/plugin-tokens.js';
import { createTSDiagnostic } from '../helpers.js';

describe(TypescriptChecker.name, () => {
  let sut: TypescriptChecker;
  let compilerMock: sinon.SinonStubbedInstance<TypescriptCompiler>;
  let options: TypescriptCheckerOptionsWithStrykerOptions;
  let nodes: Map<string, TSFileNode>;
  beforeEach(() => {
    nodes = new Map();
    options = testInjector.options as TypescriptCheckerOptionsWithStrykerOptions;
    options.typescriptChecker = { prioritizePerformanceOverAccuracy: true };
    compilerMock = sinon.createStubInstance(TypescriptCompiler);
    sinon.stub(compilerMock, 'nodes').get(() => nodes);
    sut = testInjector.injector.provideValue(pluginTokens.tsCompiler, compilerMock).injectClass(TypescriptChecker);
  });

  describe(TypescriptChecker.prototype.group.name, () => {
    it('should not group mutants if prioritizePerformanceOverAccuracy is false', async () => {
      options.typescriptChecker.prioritizePerformanceOverAccuracy = false;
      const result = await sut.group([factory.mutant(), factory.mutant(), factory.mutant()]);
      expect(result.length).to.be.eq(3);
    });

    it('should group mutants if prioritizePerformanceOverAccuracy is true', async () => {
      options.typescriptChecker.prioritizePerformanceOverAccuracy = true;
      const result = await sut.group([factory.mutant(), factory.mutant(), factory.mutant()]);
      expect(result.length).to.be.eq(1);
    });
  });

  describe(TypescriptChecker.prototype.check.name, () => {
    it("should reject when errors don't provide a file name", async () => {
      // Arrange
      const mutants = [factory.mutant({ fileName: 'foo.ts', id: '41' }), factory.mutant({ fileName: 'bar.js', id: '42' })];
      compilerMock.nodes.set('foo.ts', new TSFileNode('foo.ts', [], []));
      compilerMock.check.resolves([createTSDiagnostic({ file: undefined, messageText: 'fooError' })]);

      // Act
      await expect(sut.check(mutants)).rejectedWith(
        `Typescript error: 'fooError' was reported without a corresponding file. This shouldn't happen. Please open an issue using this link: ${strykerReportBugUrl(
          '[BUG]: TypeScript checker reports compile error without a corresponding file: fooError'
        )}`
      );
    });
    it('should reject when errors relate to an unrelated file', async () => {
      // Arrange
      const mutants = [factory.mutant({ fileName: 'foo.ts', id: '41' }), factory.mutant({ fileName: 'foo.ts', id: '42' })];
      compilerMock.nodes.set('foo.ts', new TSFileNode('foo.ts', [], []));
      compilerMock.check.resolves([
        createTSDiagnostic({ file: ts.createSourceFile('bar.ts', '', ts.ScriptTarget.Latest, false, undefined), messageText: 'fooError' }),
      ]);

      // Act
      await expect(sut.check(mutants)).rejectedWith(
        `Typescript error: 'fooError' was reported in an unrelated file (bar.ts). This file is not part of your project, or referenced from your project. This shouldn't happen, please open an issue using this link: ${strykerReportBugUrl(
          '[BUG]: TypeScript checker reports compile error in an unrelated file: fooError'
        )}`
      );
    });
  });
});
