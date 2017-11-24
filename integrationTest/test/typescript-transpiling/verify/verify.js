"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var fs = require("mz/fs");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var expectFileExists = function (path) { return expect(fs.exists(path), "File " + path + " does not exist").to.eventually.eq(true); };
describe('Verify stryker has ran correctly', function () {
    describe('html reporter', function () {
        it('should report in html files', function () {
            return Promise.all([
                expectFileExists('reports/mutation/html/Add.ts.html'),
                expectFileExists('reports/mutation/html/Circle.ts.html'),
                expectFileExists('reports/mutation/html/index.html')
            ]);
        });
        it('should copy over the resources', function () {
            return Promise.all([
                expectFileExists('reports/mutation/html/strykerResources/stryker.css'),
                expectFileExists('reports/mutation/html/strykerResources/stryker.js'),
                expectFileExists('reports/mutation/html/strykerResources/stryker-80x80.png'),
                expectFileExists('reports/mutation/html/strykerResources/bootstrap/css/bootstrap.min.css'),
                expectFileExists('reports/mutation/html/strykerResources/bootstrap/css/bootstrap.min.css'),
                expectFileExists('reports/mutation/html/strykerResources/highlightjs/styles/default.css')
            ]);
        });
    });
});
//# sourceMappingURL=verify.js.map