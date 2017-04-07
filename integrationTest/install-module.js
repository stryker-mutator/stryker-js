"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Executor_1 = require("./Executor");
var chai_1 = require("chai");
describe('we have a module using stryker', function () {
    this.timeout(500000);
    describe('after installing Stryker', function () {
        var executor;
        before(function (done) {
            executor = new Executor_1.default('./module');
            executor.exec('npm install', {}, function (errors) { return done(errors); });
        });
        describe('when compiling typescript', function () {
            it('should not result in errors', function (done) {
                executor.exec('npm run tsc', {}, function (errors) { return done(errors); });
            });
        });
        describe('when running stryker with a config file', function () {
            var resultOutput;
            before(function (done) {
                executor.exec('npm run stryker:config', {}, function (errors, stdout) {
                    resultOutput = stdout;
                    done(errors);
                });
            });
            it('should have ran stryker', function () {
                chai_1.expect(resultOutput).to.have.string('Initial test run succeeded. Ran 6 tests');
                chai_1.expect(resultOutput).to.have.string('Mutation score based on covered code');
                chai_1.expect(resultOutput).to.have.string('Mutation score based on all code');
            });
        });
    });
});
//# sourceMappingURL=install-module.js.map