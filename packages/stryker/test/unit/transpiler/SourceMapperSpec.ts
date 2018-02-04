import { expect } from 'chai';
import * as sourceMapModule from 'source-map';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import SourceMapper, { PassThroughSourceMapper, TranspiledSourceMapper, MappedLocation, SourceMapError } from '../../../src/transpiler/SourceMapper';
import { Mock, mock, config as configFactory, location as locationFactory, textFile, mappedLocation, binaryFile } from '../../helpers/producers';

const GREATEST_LOWER_BOUND = sourceMapModule.SourceMapConsumer.GREATEST_LOWER_BOUND;
const LEAST_UPPER_BOUND = sourceMapModule.SourceMapConsumer.LEAST_UPPER_BOUND;

function base64Encode(input: string) {
  return Buffer.from(input).toString('base64');
}

const ERROR_POSTFIX = '. Cannot analyse code coverage. Setting `coverageAnalysis: "off"` in your stryker.conf.js will prevent this error, but forces Stryker to run each test for each mutant.';

describe('SourceMapper', () => {
  let sut: SourceMapper;
  let sourceMapConsumerMock: Mock<sourceMapModule.SourceMapConsumer>;
  let config: Config;

  beforeEach(() => {
    config = configFactory();
    sourceMapConsumerMock = mock(sourceMapModule.SourceMapConsumer);

    // For some reason, `generatedPositionFor` is not defined on the `SourceMapConsumer` prototype
    // Define it here by hand
    sourceMapConsumerMock.generatedPositionFor = sandbox.stub();
    sourceMapConsumerMock.generatedPositionFor.returns({
      line: 1,
      column: 2
    });
    sandbox.stub(sourceMapModule, 'SourceMapConsumer').returns(sourceMapConsumerMock);

    // Restore the static values, removed by the stub
    sourceMapModule.SourceMapConsumer.LEAST_UPPER_BOUND = LEAST_UPPER_BOUND;
    sourceMapModule.SourceMapConsumer.GREATEST_LOWER_BOUND = GREATEST_LOWER_BOUND;
  });

  describe('create', () => {
    it('should create a PassThrough source mapper when no transpiler was configured', () => {
      config.transpilers = [];
      expect(SourceMapper.create([], config)).instanceOf(PassThroughSourceMapper);
    });
    it('should create a Transpiled source mapper when a transpiler was configured', () => {
      config.transpilers = ['a transpiler'];
      expect(SourceMapper.create([], config)).instanceOf(TranspiledSourceMapper);
    });
  });

  describe('PassThrough', () => {
    beforeEach(() => {
      sut = new PassThroughSourceMapper();
    });

    it('should pass through the input on transpiledLocationFor', () => {
      const input: MappedLocation = {
        fileName: 'foo/bar.js',
        location: locationFactory()
      };
      expect(sut.transpiledLocationFor(input)).eq(input);
    });
  });

  describe('Transpiled', () => {
    let transpiledFiles: File[];

    beforeEach(() => {
      transpiledFiles = [];
      sut = new TranspiledSourceMapper(transpiledFiles);
    });

    it('should create SourceMapConsumers for mutated text files when transpiledLocationFor is called', () => {
      // Arrange
      const expectedMapFile1 = { sources: ['file1.ts'] };
      const expectedMapFile2 = { sources: ['file2.ts'] };
      transpiledFiles.push(textFile({
        name: 'file1.js', mutated: true, content: `// # sourceMappingURL=file1.js.map`
      }));
      transpiledFiles.push(textFile({
        name: 'file1.js.map', mutated: false, content: JSON.stringify(expectedMapFile1)
      }));
      transpiledFiles.push(textFile({
        name: 'file2.js', mutated: true, content: `// # sourceMappingURL=data:application/json;base64,${base64Encode(JSON.stringify(expectedMapFile2))}`
      }));

      // Act
      sut.transpiledLocationFor(mappedLocation({ fileName: 'file1.ts' }));

      // Assert
      expect(sourceMapModule.SourceMapConsumer).calledWithNew;
      expect(sourceMapModule.SourceMapConsumer).calledWith(expectedMapFile1);
      expect(sourceMapModule.SourceMapConsumer).calledWith(expectedMapFile2);
    });

    it('should cache source maps for future use when `transpiledLocationFor` is called', () => {
      // Arrange
      const expectedMapFile1 = { sources: ['file1.ts'] };
      transpiledFiles.push(textFile({
        name: 'file1.js', mutated: true, content: `// # sourceMappingURL=data:application/json;base64,${base64Encode(JSON.stringify(expectedMapFile1))}`
      }));

      // Act
      sut.transpiledLocationFor(mappedLocation({ fileName: 'file1.ts' }));
      sut.transpiledLocationFor(mappedLocation({ fileName: 'file1.ts' }));

      // Assert
      expect(sourceMapModule.SourceMapConsumer).calledOnce;
    });

    it('should throw an error when the requested source map could not be found', () => {
      expect(() => sut.transpiledLocationFor(mappedLocation({ fileName: 'foobar' })))
        .throws(SourceMapError, 'Source map not found for "foobar"' + ERROR_POSTFIX);
    });

    it('should throw an error if source map file is a binary file', () => {
      transpiledFiles.push(textFile({
        name: 'file1.js', mutated: true, content: '// # sourceMappingURL=file1.js.map'
      }));
      transpiledFiles.push(binaryFile({
        name: 'file1.js.map'
      }));
      expect(() => sut.transpiledLocationFor(mappedLocation({ fileName: 'foobar' })))
        .throws(SourceMapError, `Source map file "file1.js.map" has the wrong file kind. "Binary" instead of "Text"${ERROR_POSTFIX}`);
    });

    it('should throw an error if source map data url is not supported', () => {
      const expectedMapFile1 = { sources: ['file1.ts'] };
      transpiledFiles.push(textFile({
        name: 'file1.js', mutated: true, content: `// # sourceMappingURL=data:application/xml;base64,${base64Encode(JSON.stringify(expectedMapFile1))}`
      }));
      expect(() => sut.transpiledLocationFor(mappedLocation({ fileName: 'foobar' })))
        .throws(SourceMapError, `Source map file for "file1.js" cannot be read. Data url "data:application/xml;base64" found, where "data:application/json;base64" was expected${ERROR_POSTFIX}`);
    });

    it('should throw an error if source map file cannot be found', () => {
      transpiledFiles.push(textFile({
        name: 'file1.js', mutated: true, content: `// # sourceMappingURL=file1.js.map`
      }));
      expect(() => sut.transpiledLocationFor(mappedLocation({ fileName: 'foobar' })))
        .throws(SourceMapError, `Source map file "file1.js.map" (referenced by "file1.js") cannot be found in list of transpiled files${ERROR_POSTFIX}`);
    });

    it('should throw an error if source map file url is not declared in a transpiled file', () => {
      transpiledFiles.push(textFile({
        name: 'file1.js', mutated: true, content: `// # sourceMapping%%%=file1.js.map`
      }));
      expect(() => sut.transpiledLocationFor(mappedLocation({ fileName: 'foobar' })))
        .throws(SourceMapError, `No source map reference found in transpiled file "file1.js"${ERROR_POSTFIX}`);
    });
  });
});