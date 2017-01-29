import { expect } from 'chai';
import * as fileUtils from '../../src/utils/fileUtils';
import Mutant from '../../src/Mutant';
import MutatorOrchestrator from '../../src/MutatorOrchestrator';
import { Mutator, MutatorFactory } from 'stryker-api/mutant';
import * as sinon from 'sinon';
import { Syntax } from 'esprima';
import StrykerTempFolder from '../../src/utils/StrykerTempFolder';
import * as estree from 'estree';
import StrictReporter from '../../src/reporters/StrictReporter';

describe('MutatorOrchestrator', () => {
  let sut: MutatorOrchestrator;
  let fileUtilsStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  let reporter: StrictReporter;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(StrykerTempFolder, 'writeFile');
    reporter = { onSourceFileRead: sandbox.stub(), onAllSourceFilesRead: sandbox.stub(), onAllMutantsMatchedWithTests: sandbox.stub(), onMutantTested: sandbox.stub(), onAllMutantsTested: sandbox.stub(), wrapUp: sandbox.stub()};
    sut = new MutatorOrchestrator(reporter);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw an error if no source files are provided', () => {
    expect(sut.generateMutants).to.throw(Error);
  });

  it('should return an empty array if nothing could be mutated', () => {
    fileUtilsStub = sandbox.stub(fileUtils, 'readFile', () => '');

    const mutants = sut.generateMutants(['test.js']);

    expect(mutants.length).to.equal(0);
  });

  describe('with single input file with a one possible mutation', () => {
    let originalCode: string;
    let mutatedCode: string;
    let mutants: Mutant[];

    beforeEach(() => {
      originalCode = 'var i = 1 + 2;';
      mutatedCode = 'var i = 1 - 2;';
      fileUtilsStub = sandbox.stub(fileUtils, 'readFile', () => originalCode);
      mutants = sut.generateMutants(['test.js']);
    });

    it('should return an array with a single mutant', () => {
      expect(mutants.length).to.equal(1);
    });

    it('should be able to mutate code', () => {
      mutants[0].save('some file');
      expect(StrykerTempFolder.writeFile).to.have.been.calledWith('some file', mutatedCode);
    });

    it('should set the mutated line number', () => {
      originalCode = '\n\nvar i = 1 + 2;';
      mutatedCode = '\n\nvar i = 1 - 2;';

      mutants = sut.generateMutants(['test.js']);

      expect(mutants[0].location.start.line).to.equal(3);
    });

    it('should report onSourceFileRead', () => expect(reporter.onSourceFileRead).to.have.been.calledWith({ path: 'test.js', content: originalCode }));

    it('should report onAllSourceFilesRead', () => expect(reporter.onAllSourceFilesRead).to.have.been.calledWith([{ path: 'test.js', content: originalCode }]));
  });

  it('should not stop executing when a file does not exist', () => {
    const mutants = sut.generateMutants(['someFileWhichShouldNotExist.js']);

    expect(mutants.length).to.equal(0);
  });

  describe('should be able to handle a Mutator that returns', () => {

    class StubMutator implements Mutator {
      name: 'stub';
      applyMutations(node: estree.Node, copy: (obj: any, deep?: boolean) => any): estree.Node[] {
        let nodes: estree.Node[] = [];
        if (node.type === Syntax.BinaryExpression) {
          // eg: '1 * 2': push child node
          nodes.push(<estree.Expression>(<estree.BinaryExpression>node).left);
        } else if (node.type === Syntax.IfStatement) {
          // eg: 'if(true);': push original node
          nodes.push(node);
        }
        return nodes;
      }
    }

    beforeEach(() => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames', () => ['test']);

      sandbox.stub(MutatorFactory.instance(), 'create', () => new StubMutator());
      sut = new MutatorOrchestrator(reporter);
    });

    afterEach(() => {
      sinon.restore(MutatorFactory.instance().knownNames);
      sinon.restore(MutatorFactory.instance().create);
    });

    it('the same nodeID', () => {
      fileUtilsStub = sandbox.stub(fileUtils, 'readFile', () => {
        return 'if (true);';
      });

      let mutants = sut.generateMutants(['src.js']);
      mutants[0].save('some file');
      expect(StrykerTempFolder.writeFile).to.have.been.calledWith('some file', 'if (true);');
    });

    it('a different nodeID', () => {
      fileUtilsStub = sandbox.stub(fileUtils, 'readFile', () => {
        return '1 * 2';
      });

      let mutants = sut.generateMutants(['src.js']);
      mutants[0].save('some file');
      expect(StrykerTempFolder.writeFile).to.have.been.calledWith('some file', '1 * 2');
    });
  });

});
