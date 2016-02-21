'use strict';

var expect = require('chai').expect;
import Mutant from '../../src/Mutant';
import ConditionalBoundaryMutation from '../../src/mutations/ConditionalBoundayMutation';
import ParserUtils from '../../src/utils/ParserUtils';
import TestResult from '../../src/TestResult';
require('mocha-sinon');

describe("TestResult", function() {
  var testResult: TestResult;
  var mutant: Mutant;

  var getTestResult = function(nrSucceeded: number, nrFailed: number, timedOut: boolean, error: boolean){
    return new TestResult(['a.js'], [], nrSucceeded, nrFailed, timedOut, error, 1000);
  };

  beforeEach(function(){
    this.sinon.stub(Mutant.prototype, 'save');
    var parserUtils = new ParserUtils();
    var originalCode =
    'var add = function(num1, num2) {\n      return num1 + num2;\n    };\n    \n    var addOne = function(number) {\n      number++;\n      return number;\n    };\n    \n    var negate = function(number) {\n      return -number;\n    };\n    \n    var isNegativeNumber = function(number) {\n      var isNegative = false;\n      if(number < 0){\n        isNegative = true;\n      }\n      return isNegative;\n    };';

    var filename = 'C:\\workspace\\stryker\\test\\sampleProject\\src\\Add.js';
    var ast = parserUtils.parse(originalCode);
    var node = ast.body[3].declarations[0].init.body.body[1].test;
    var mutation = new ConditionalBoundaryMutation();
    mutant = mutation.applyMutation(filename, originalCode, node, ast)[0];

    testResult = new TestResult([filename], [], 1, 0, false, false, 1000);
    testResult.setCoverage({
    "C:\\workspace\\stryker\\test\\sampleProject\\src\\Add.js":{"path":"C:\\workspace\\stryker\\test\\sampleProject\\src\\Add.js","s":{"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":2,"10":2,"11":1,"12":2},"b":{"1":[1,1]},"f":{"1":1,"2":1,"3":1,"4":2},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":10},"end":{"line":1,"column":31}}},"2":{"name":"(anonymous_2)","line":5,"loc":{"start":{"line":5,"column":13},"end":{"line":5,"column":30}}},"3":{"name":"(anonymous_3)","line":10,"loc":{"start":{"line":10,"column":13},"end":{"line":10,"column":30}}},"4":{"name":"(anonymous_4)","line":14,"loc":{"start":{"line":14,"column":23},"end":{"line":14,"column":40}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":3,"column":2}},"2":{"start":{"line":2,"column":2},"end":{"line":2,"column":21}},"3":{"start":{"line":5,"column":0},"end":{"line":8,"column":2}},"4":{"start":{"line":6,"column":2},"end":{"line":6,"column":11}},"5":{"start":{"line":7,"column":2},"end":{"line":7,"column":16}},"6":{"start":{"line":10,"column":0},"end":{"line":12,"column":2}},"7":{"start":{"line":11,"column":2},"end":{"line":11,"column":17}},"8":{"start":{"line":14,"column":0},"end":{"line":20,"column":2}},"9":{"start":{"line":15,"column":2},"end":{"line":15,"column":25}},"10":{"start":{"line":16,"column":2},"end":{"line":18,"column":3}},"11":{"start":{"line":17,"column":4},"end":{"line":17,"column":22}},"12":{"start":{"line":19,"column":2},"end":{"line":19,"column":20}}},"branchMap":{"1":{"line":16,"type":"if","locations":[{"start":{"line":16,"column":2},"end":{"line":16,"column":2}},{"start":{"line":16,"column":2},"end":{"line":16,"column":2}}]}},"l":{"1":1,"2":1,"5":1,"6":1,"7":1,"10":1,"11":1,"14":1,"15":2,"16":2,"17":1,"19":2}},
    "C:\\workspace\\stryker\\test\\sampleProject\\src\\Circle.js":{"path":"C:\\workspace\\stryker\\test\\sampleProject\\src\\Circle.js","s":{"1":1,"2":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":23},"end":{"line":1,"column":40}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":4,"column":2}},"2":{"start":{"line":3,"column":2},"end":{"line":3,"column":30}}},"branchMap":{},"l":{"1":1,"3":0}}}
    );
  });

  describe("should say that the test was successful", function() {
    it("if a test succeeded", function() {
        var result = getTestResult(1, 0, false, false);

        expect(result.getAllTestsSuccessful()).to.equal(true);
    });

    it("if no tests succeeded or failed", function() {
        var result = getTestResult(0, 0, false, false);

        expect(result.getAllTestsSuccessful()).to.equal(true);
    });
  });

  describe("should say that the test was unsuccessful", function() {
    it("if one test failed", function() {
        var result = getTestResult(5, 1, false, false);

        expect(result.getAllTestsSuccessful()).to.equal(false);
    });

    it("if an error occurred", function() {
        var result = getTestResult(0, 0, false, true);

        expect(result.getAllTestsSuccessful()).to.equal(false);
    });

    it("if a time-out happened", function() {
        var result = getTestResult(5, 0, true, false);

        expect(result.getAllTestsSuccessful()).to.equal(false);
    });
  });

  it("should recognize when it's covered by a mutant", function() {
      var covered = testResult.coversMutant(mutant);

      expect(covered).to.equal(true);
  });

  it("should recognize when it does not cover a mutant", function() {
    testResult.setCoverage({
    "C:\\workspace\\stryker\\test\\sampleProject\\src\\Add.js":{"path":"C:\\workspace\\stryker\\test\\sampleProject\\src\\Add.js","s":{"1":1,"2":0,"3":1,"4":0,"5":0,"6":1,"7":0,"8":1,"9":0,"10":0,"11":0,"12":0},"b":{"1":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":10},"end":{"line":1,"column":31}}},"2":{"name":"(anonymous_2)","line":5,"loc":{"start":{"line":5,"column":13},"end":{"line":5,"column":30}}},"3":{"name":"(anonymous_3)","line":10,"loc":{"start":{"line":10,"column":13},"end":{"line":10,"column":30}}},"4":{"name":"(anonymous_4)","line":14,"loc":{"start":{"line":14,"column":23},"end":{"line":14,"column":40}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":3,"column":2}},"2":{"start":{"line":2,"column":2},"end":{"line":2,"column":21}},"3":{"start":{"line":5,"column":0},"end":{"line":8,"column":2}},"4":{"start":{"line":6,"column":2},"end":{"line":6,"column":11}},"5":{"start":{"line":7,"column":2},"end":{"line":7,"column":16}},"6":{"start":{"line":10,"column":0},"end":{"line":12,"column":2}},"7":{"start":{"line":11,"column":2},"end":{"line":11,"column":17}},"8":{"start":{"line":14,"column":0},"end":{"line":20,"column":2}},"9":{"start":{"line":15,"column":2},"end":{"line":15,"column":25}},"10":{"start":{"line":16,"column":2},"end":{"line":18,"column":3}},"11":{"start":{"line":17,"column":4},"end":{"line":17,"column":22}},"12":{"start":{"line":19,"column":2},"end":{"line":19,"column":20}}},"branchMap":{"1":{"line":16,"type":"if","locations":[{"start":{"line":16,"column":2},"end":{"line":16,"column":2}},{"start":{"line":16,"column":2},"end":{"line":16,"column":2}}]}},"l":{"1":1,"2":0,"5":1,"6":0,"7":0,"10":1,"11":0,"14":1,"15":0,"16":0,"17":0,"19":0}},
    "C:\\workspace\\stryker\\test\\sampleProject\\src\\Circle.js":{"path":"C:\\workspace\\stryker\\test\\sampleProject\\src\\Circle.js","s":{"1":1,"2":1},"b":{},"f":{"1":1},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":23},"end":{"line":1,"column":40}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":4,"column":2}},"2":{"start":{"line":3,"column":2},"end":{"line":3,"column":30}}},"branchMap":{},"l":{"1":1,"3":1}}}
    );
    var covered = testResult.coversMutant(mutant);

    expect(covered).to.equal(false);
  });
});
