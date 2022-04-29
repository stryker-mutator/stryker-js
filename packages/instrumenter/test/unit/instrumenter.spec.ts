import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { I, File } from '@stryker-mutator/util';

import { Instrumenter } from '../../src/index.js';
import * as parsers from '../../src/parsers/index.js';
import * as transformers from '../../src/transformers/index.js';
import * as printers from '../../src/printers/index.js';
import { createJSAst, createTSAst, createMutable, createInstrumenterOptions } from '../helpers/factories.js';
import { parseJS } from '../helpers/syntax-test-helpers.js';
import { instrumenterTokens } from '../../src/instrumenter-tokens.js';

describe(Instrumenter.name, () => {
  let sut: Instrumenter;

  class Helper {
    public parserStub = sinon.stub();
    public transformerStub: sinon.SinonStubbedMember<typeof transformers.transform> = sinon.stub();
    public printerStub: sinon.SinonStubbedMember<typeof printers.print> = sinon.stub();
    public createParserStub: sinon.SinonStubbedMember<typeof parsers.createParser> = sinon.stub();
    constructor() {
      this.createParserStub.returns(this.parserStub);
    }
  }
  let helper: Helper;

  beforeEach(() => {
    helper = new Helper();
    sut = testInjector.injector
      .provideValue(instrumenterTokens.createParser, helper.createParserStub)
      .provideValue(instrumenterTokens.print, helper.printerStub)
      .provideValue(instrumenterTokens.transform, helper.transformerStub)
      .injectClass(Instrumenter);
  });

  async function act(input: readonly File[], options = createInstrumenterOptions()) {
    return await sut.instrument(input, options);
  }

  it('should parse, transform and print each file', async () => {
    // Arrange
    const { input, output } = arrangeTwoFiles();

    // Act
    const actualResult = await act(input);

    // Assert
    expect(actualResult.files).deep.eq([new File('foo.js', output[0]), new File('bar.ts', output[1])]);
  });

  it('should convert line numbers to be 1-based (for babel internals)', async () => {
    // Arrange
    const { input } = arrangeTwoFiles();

    // Act
    await act(
      input,
      createInstrumenterOptions({ mutationRanges: [{ fileName: 'foo.js', start: { line: 0, column: 0 }, end: { line: 6, column: 42 } }] })
    );

    // Assert
    const actual = helper.transformerStub.getCall(0).args[2];
    const expected: transformers.TransformerOptions = createInstrumenterOptions({
      excludedMutations: [],
      mutationRanges: [{ fileName: 'foo.js', start: { line: 1, column: 0 }, end: { line: 7, column: 42 } }],
    });
    expect(actual).deep.eq({ options: expected });
  });

  it('should log about instrumenting', async () => {
    await act([new File('b.js', 'foo'), new File('a.js', 'bar')]);
    expect(testInjector.logger.debug).calledWith('Instrumenting %d source files with mutants', 2);
  });

  it('should log about the result', async () => {
    helper.transformerStub.callsFake((_, collector: I<transformers.MutantCollector>) => {
      collector.collect('foo.js', parseJS('bar').program.body[0], createMutable());
    });
    await act([new File('b.js', 'foo'), new File('a.js', 'bar')]);
    expect(testInjector.logger.info).calledWith('Instrumented %d source file(s) with %d mutant(s)', 2, 2);
  });

  it('should log between each file', async () => {
    // Arrange
    testInjector.logger.isDebugEnabled.returns(true);
    const { input, asts } = arrangeTwoFiles();
    const fakeTransform: typeof transformers.transform = (ast, collector) => {
      if (ast === asts[0]) {
        collector.collect('foo.js', parseJS('bar').program.body[0], createMutable());
      }
      if (ast === asts[1]) {
        collector.collect('foo.js', parseJS('bar').program.body[0], createMutable());
        collector.collect('foo.js', parseJS('bar').program.body[0], createMutable());
      }
    };
    helper.transformerStub.callsFake(fakeTransform);

    // Act
    await act(input);

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
