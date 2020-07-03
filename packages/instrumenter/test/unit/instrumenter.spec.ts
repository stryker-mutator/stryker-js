import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { File } from '@stryker-mutator/api/core';

import { Instrumenter } from '../../src';
import * as parsers from '../../src/parsers';
import * as transformers from '../../src/transformers';
import * as printers from '../../src/printers';
import { createJSAst, createTSAst, createNamedNodeMutation } from '../helpers/factories';

describe(Instrumenter.name, () => {
  let sut: Instrumenter;

  class Helper {
    public parserStub = sinon.stub(parsers, 'parse');
    public transformerStub = sinon.stub(transformers, 'transform');
    public printerStub = sinon.stub(printers, 'print');
  }
  let helper: Helper;

  beforeEach(() => {
    helper = new Helper();
    sut = testInjector.injector.injectClass(Instrumenter);
  });

  it('should parse, transform and print each file', async () => {
    // Arrange
    const { input, output } = arrangeTwoFiles();

    // Act
    const actualResult = await sut.instrument(input);

    // Assert
    expect(actualResult.files).deep.eq([new File('foo.js', output[0]), new File('bar.ts', output[1])]);
  });

  it('should log about instrumenting', async () => {
    await sut.instrument([new File('b.js', 'foo'), new File('a.js', 'bar')]);
    expect(testInjector.logger.debug).calledWith('Instrumenting %d source files with mutants', 2);
  });

  it('should log about the result', async () => {
    helper.transformerStub.callsFake((_, collector: transformers.MutantCollector) => {
      collector.add('foo.js', createNamedNodeMutation());
    });
    await sut.instrument([new File('b.js', 'foo'), new File('a.js', 'bar')]);
    expect(testInjector.logger.info).calledWith('Instrumented %d source file(s) with %d mutant(s)', 2, 2);
  });

  it('should log between each file', async () => {
    // Arrange
    testInjector.logger.isDebugEnabled.returns(true);
    const { input, asts } = arrangeTwoFiles();
    const fakeTransform: typeof transformers.transform = (ast, collector) => {
      if (ast === asts[0]) {
        collector.add('foo.js', createNamedNodeMutation());
      }
      if (ast === asts[1]) {
        collector.add('foo.js', createNamedNodeMutation());
        collector.add('foo.js', createNamedNodeMutation());
      }
    };
    helper.transformerStub.callsFake(fakeTransform);

    // Act
    await sut.instrument(input);

    // Assert
    expect(testInjector.logger.debug).calledWith('Instrumented foo.js (1 mutant(s))');
    expect(testInjector.logger.debug).calledWith('Instrumented bar.ts (2 mutant(s))');
  });

  function arrangeTwoFiles() {
    const input = [new File('foo.js', 'foo'), new File('bar.ts', 'bar')];
    const asts = [createJSAst(), createTSAst()];
    const output = ['instrumented js', 'instrumented ts'];
    helper.parserStub.withArgs(input[0].textContent).resolves(asts[0]).withArgs(input[1].textContent).resolves(asts[1]);
    helper.printerStub.withArgs(asts[0]).returns(output[0]).withArgs(asts[1]).returns(output[1]);
    return { input, asts, output };
  }
});
