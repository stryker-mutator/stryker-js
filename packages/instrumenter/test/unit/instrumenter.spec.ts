import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { I } from '@stryker-mutator/util';

import { File, Instrumenter } from '../../src/index.js';
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
    const expectedFiles: File[] = [
      { name: 'foo.js', content: output[0], mutate: true },
      { name: 'bar.ts', content: output[1], mutate: true },
    ];
    expect(actualResult.files).deep.eq(expectedFiles);
  });

  it('should convert line numbers to be 1-based (for babel internals)', async () => {
    // Arrange
    const { input } = arrangeTwoFiles();
    input[0].mutate = [{ start: { line: 0, column: 0 }, end: { line: 6, column: 42 } }];

    // Act
    await act(input);

    // Assert
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring
    const actual = helper.transformerStub.getCall(0).args[2];
    const expected: transformers.TransformerOptions = createInstrumenterOptions({
      excludedMutations: [],
    });
    expect(actual).deep.eq({
      options: expected,
      mutateDescription: [{ start: { line: 1, column: 0 }, end: { line: 7, column: 42 } }],
      logger: testInjector.logger,
    });
  });

  it('should log about instrumenting', async () => {
    await act([
      { name: 'b.js', content: 'foo', mutate: true },
      { name: 'a.js', content: 'bar', mutate: true },
    ]);
    expect(testInjector.logger.debug).calledWith('Instrumenting %d source files with mutants', 2);
  });

  it('should log about the result', async () => {
    helper.transformerStub.callsFake((_, collector: I<transformers.MutantCollector>) => {
      collector.collect('foo.js', parseJS('bar').program.body[0], createMutable());
    });
    await act([
      { name: 'b.js', content: 'foo', mutate: true },
      { name: 'a.js', content: 'bar', mutate: true },
    ]);
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
    const input: File[] = [
      { name: 'foo.js', content: 'foo', mutate: true },
      { name: 'bar.ts', content: 'bar', mutate: true },
    ];
    const asts = [createJSAst(), createTSAst()];
    const output = ['instrumented js', 'instrumented ts'];
    helper.parserStub.withArgs(input[0].content).resolves(asts[0]).withArgs(input[1].content).resolves(asts[1]);
    helper.printerStub.withArgs(asts[0]).returns(output[0]).withArgs(asts[1]).returns(output[1]);
    return { input, asts, output };
  }
});
