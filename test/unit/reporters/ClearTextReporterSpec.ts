var expect = require('chai').expect;
import ConsoleReporter from '../../../src/reporters/ClearTextReporter';
import MathMutator from '../../../src/mutators/MathMutator';
import Mutant from '../../../src/Mutant';
import * as sinon from 'sinon';


describe('ClearTextReporter', function () {
  let consoleReporter: ConsoleReporter;
  let mutant: Mutant;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(Mutant.prototype, 'save');
    var log = console.log;
    sandbox.stub(console, 'log', function () {
      return log.apply(log, arguments);
    });

    var originalCode = "var i = 1 - 1;";
    var mutatedCode = "var i = 1 + 1;";
    consoleReporter = new ConsoleReporter();

    var location: ESTree.SourceLocation = {
      start: {
        line: 1,
        column: 11
      },
      end: {
        line: 1,
        column: 12
      }
    };
    mutant = new Mutant('some mutator', 'a.js', originalCode, '+', location);
  });

  

  afterEach(() => sandbox.restore());
});
