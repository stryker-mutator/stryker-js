"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Circle_1 = require("../src/Circle");
describe('Circle', function () {
    it('should have a circumference of 2PI when the radius is 1', function () {
        var radius = 1;
        var expectedCircumference = 2 * Math.PI;
        var circumference = Circle_1.getCircumference(radius);
        chai_1.expect(circumference).to.be.equal(expectedCircumference);
    });
});
//# sourceMappingURL=CircleSpec.js.map