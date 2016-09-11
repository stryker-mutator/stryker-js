'use strict';

import {expect} from 'chai';
import Mutant from '../../src/Mutant';
import {MutantStatus} from 'stryker-api/report';
import {Location} from 'stryker-api/core';
import BinaryOperatorMutator from '../../src/mutators/BinaryOperatorMutator';
import * as parserUtils from '../../src/utils/parserUtils';
import * as sinon from 'sinon';
import StrykerTempFolder from '../../src/utils/StrykerTempFolder';
import * as estree from 'stryker-api/estree';

describe('Mutant', function () {
  var sut: Mutant;
  var filename: string;
  var mutator: BinaryOperatorMutator;
  var originalLine: string;
  var originalCode: string;
  var mutatedLine: string;
  var mutatedCode: string;
  var lineNumber: number;
  var ast: estree.Program;
  var node: estree.Node;
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
    node = <estree.Expression>(<estree.VariableDeclaration>ast.body[1]).declarations[0].init;
  });

  describe('with single line code', () => {

    beforeEach(() => {
      let location: Location = {
        start: {
          line: 2,
          column: 0
        },
        end: {
          line: 2,
          column: 14
        },
      };
      sut = new Mutant('Math', filename, originalCode, '/', location, [16, 30]);

    });
    describe('should set', function () {
      it('the filename', function () {
        expect(sut.filename).to.equal(filename);
      });

      it('the mutator', function () {
        expect(sut.mutatorName).to.equal('Math');
      });

    });
  });

  describe('with multi-line substitude', () => {
    let expectedOriginalLines: string;
    let expectedMutatedLines: string;
    let originalCode: string;
    let mutatedCode: string;
    let restOfCode: string;

    beforeEach(() => {
      let start = 'if(';
      let toBeMutated = `a > b
        && c < d
        || b == c`;
        
      expectedOriginalLines =
        `${start}${toBeMutated}) {`;
      restOfCode = `
          console.log('hello world!');
        }`;
      originalCode = expectedOriginalLines + restOfCode;
      let substitude = 'false';
      expectedMutatedLines = 'if(' + substitude + ') {';
      let location: Location = {
        start: {
          line: 1,
          column: 3
        },
        end: {
          line: 3,
          column: 17
        },
      };

      sut = new Mutant('mutator', filename, originalCode, substitude, location, [start.length, start.length + toBeMutated.length]);
    });

    it('should generate the correct mutated code', () => {
      var code = expectedMutatedLines + restOfCode;
      //Some empty lines are needed. These are not allowed to contain spaces
      sut.save('a file');
      expect(StrykerTempFolder.writeFile).to.have.been.calledWith('a file', code);
    });
    
    it('should set the correct originalLines', () => {
      expect(sut.originalLines).to.be.eq(expectedOriginalLines);
    });
    
    it('should set the correct mutatedLines', () => {
      expect(sut.mutatedLines).to.be.eq(expectedMutatedLines);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
