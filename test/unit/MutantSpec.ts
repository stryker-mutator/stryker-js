'use strict';

import {expect} from 'chai';
import Mutant from '../../src/Mutant';
import {MutantStatus} from '../../src/api/report';
import MathMutator from '../../src/mutators/MathMutator';
import * as parserUtils from '../../src/utils/parserUtils';
import * as sinon from 'sinon';
import StrykerTempFolder from '../../src/api/util/StrykerTempFolder';

describe('Mutant', function () {
  var sut: Mutant;
  var filename: string;
  var mutator: MathMutator;
  var originalLine: string;
  var originalCode: string;
  var mutatedLine: string;
  var mutatedCode: string;
  var lineNumber: number;
  var ast: ESTree.Program;
  var node: ESTree.Node;
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();
    sandbox.stub(StrykerTempFolder, 'writeFile');

    var baseCode = 'var i = 1 + 2;\n';
    originalLine = 'var j = i * 2;';
    mutatedLine = 'var j = i / 2;';
    originalCode = baseCode + originalLine;
    mutatedCode = baseCode + mutatedLine;
    lineNumber = 2;

    filename = 'something.js';
    ast = parserUtils.parse(mutatedCode);
    node = (<ESTree.VariableDeclaration>ast.body[1]).declarations[0].init;
  });

  describe('with single line code', () => {

    beforeEach(() => {
      let location: ESTree.SourceLocation = {
        start: {
          line: 2,
          column: 10
        },
        end: {
          line: 2,
          column: 11
        }
      };
      sut = new Mutant('Math', filename, originalCode, '/', location);

    });
    describe('should set', function () {
      it('the filename', function () {
        expect(sut.fileName).to.equal(filename);
      });

      it('the mutator', function () {
        expect(sut.mutatorName).to.equal('Math');
      });

    });
  });

  describe('with multi-line substitude', () => {
    let originalLine: string;
    let originalCode: string;
    let mutatedCode: string;
    let restOfCode: string;

    beforeEach(() => {
      originalLine =
        `if(a > b
        && c < d
        || b == c) {`;
      restOfCode = `
          console.log('hello world!');
        }`;
      originalCode = originalLine + restOfCode;
      let substitude = 'false';
      mutatedLine = 'if(' + substitude + ') {';
      let location = {
        start: {
          line: 1,
          column: 3
        },
        end: {
          line: 3,
          column: 17
        }
      };

      sut = new Mutant('mutator', filename, originalCode, substitude, location);
    });

    it('should generate the correct mutated code', () => {
      var code = mutatedLine +
        `

` + restOfCode;
      //Some empty lines are needed. These are not allowed to contain spaces
      sut.save('a file');
      expect(StrykerTempFolder.writeFile).to.have.been.calledWith('a file', code);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
