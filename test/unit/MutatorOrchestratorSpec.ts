var expect = require('chai').expect;
import * as fileUtils from '../../src/utils/fileUtils';
import Mutant from '../../src/Mutant';
import MutatorOrchestrator from '../../src/MutatorOrchestrator';
import RemoveConditionalsMutator from '../../src/mutators/RemoveConditionalsMutator';
import {Mutator, MutatorFactory} from '../../src/api/mutant';
import * as sinon from 'sinon';
import {Syntax} from 'esprima';

describe('MutatorOrchestrator', () => {
  var mutatorOrchestrator: MutatorOrchestrator;
  let fileUtilsStub: sinon.SinonStub;

  beforeEach(() => {
    mutatorOrchestrator = new MutatorOrchestrator();
  });

  afterEach(() => {
    if (fileUtilsStub) {
      fileUtilsStub.restore();
    }
  });

  it('should throw an error if no source files are provided', () => {
    expect(mutatorOrchestrator.generateMutants).to.throw(Error);
  });

  it('should return an empty array if nothing could be mutated', () => {
    fileUtilsStub = sinon.stub(fileUtils, 'readFile', () => {
      return '';
    });

    var mutants = mutatorOrchestrator.generateMutants(['test.js']);

    expect(mutants.length).to.equal(0);
  });

  it('should return an array with a single mutant if only one mutant could be found in a file', () => {
    fileUtilsStub = sinon.stub(fileUtils, 'readFile', () => {
      return 'var i = 1 + 2;';
    });

    var mutants = mutatorOrchestrator.generateMutants(['test.js']);

    expect(mutants.length).to.equal(1);
  });

  it('should be able to mutate code', () => {
    var originalCode = 'var i = 1 + 2;';
    var mutatedCode = 'var i = 1 - 2;';
    fileUtilsStub = sinon.stub(fileUtils, 'readFile', () => {
      return originalCode;
    });

    var mutants = mutatorOrchestrator.generateMutants(['test.js']);

    expect(mutants[0].mutatedCode).to.equal(mutatedCode);
  });

  it('should set the mutated line number', () => {
    var originalCode = '\n\nvar i = 1 + 2;';
    var mutatedCode = '\n\nvar i = 1 - 2;';
    fileUtilsStub = sinon.stub(fileUtils, 'readFile', () => {
      return originalCode;
    });

    var mutants = mutatorOrchestrator.generateMutants(['test.js']);

    expect(mutants[0].lineNumber).to.equal(3);
  });

  it('should not stop executing when a file does not exist', () => {
    var mutants = mutatorOrchestrator.generateMutants(['someFileWhichShouldNotExist.js']);

    expect(mutants.length).to.equal(0);
  });

  describe('should be able to handle a Mutator that returns', () => {

    class StubMutator implements Mutator {
      name: 'stub';
      applyMutations(node: ESTree.Node, deepCopy: (obj: any) => any): ESTree.Node[] {
        let nodes: ESTree.Node[] = [];
        if (node.type === Syntax.BinaryExpression) {
          // eg: '1 * 2': push child node
          nodes.push((<ESTree.BinaryExpression>node).left);
        } else if (node.type === Syntax.IfStatement) {
          // eg: 'if(true);': push original node
          nodes.push(node);
        }
        return nodes;
      }
    }

    beforeEach(() => {
      sinon.stub(MutatorFactory.instance(), 'knownNames', () => {
        return ['test'];
      });

      sinon.stub(MutatorFactory.instance(), 'create', () => {
        return new StubMutator();
      });
      mutatorOrchestrator = new MutatorOrchestrator();
    });

    afterEach(() => {
      sinon.restore(MutatorFactory.instance().knownNames);
      sinon.restore(MutatorFactory.instance().create);
    });

    it('the same nodeID', () => {
      fileUtilsStub = sinon.stub(fileUtils, 'readFile', () => {
        return 'if (true);';
      });

      let mutants = mutatorOrchestrator.generateMutants(['src.js']);

      expect(mutants[0].originalLine).to.equal(mutants[0].mutatedLine);
    });

    it('a different nodeID', () => {
      fileUtilsStub = sinon.stub(fileUtils, 'readFile', () => {
        return '1 * 2';
      });

      let mutants = mutatorOrchestrator.generateMutants(['src.js']);

      expect(mutants[0].originalLine).to.equal(mutants[0].mutatedLine);
    });
  });

});
