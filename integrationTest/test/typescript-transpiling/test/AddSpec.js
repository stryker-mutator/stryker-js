"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Add_1 = require("../src/Add");
describe('Add', function () {
    it('should be able to add two numbers', function () {
        var num1 = 2;
        var num2 = 5;
        var expected = num1 + num2;
        var actual = Add_1.add(num1, num2);
        chai_1.expect(actual).to.be.equal(expected);
    });
    it('should be able 1 to a number', function () {
        var number = 2;
        var expected = 3;
        var actual = Add_1.addOne(number);
        chai_1.expect(actual).to.be.equal(expected);
    });
    it('should be able negate a number', function () {
        var number = 2;
        var expected = -2;
        var actual = Add_1.negate(number);
        chai_1.expect(actual).to.be.equal(expected);
    });
    it('should be able to recognize a negative number', function () {
        var number = -2;
        var isNegative = Add_1.isNegativeNumber(number);
        chai_1.expect(isNegative).to.be.true;
    });
    it('should be able to recognize that 0 is not a negative number', function () {
        var number = 0;
        var isNegative = Add_1.isNegativeNumber(number);
        chai_1.expect(isNegative).to.be.false;
    });
});
//# sourceMappingURL=AddSpec.js.map