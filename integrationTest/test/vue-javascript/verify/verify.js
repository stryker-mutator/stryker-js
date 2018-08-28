"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("mz/fs");
var chai_1 = require("chai");
var path = require("path");
describe('After running stryker on VueJS project', function () {
    it('should report 20% mutation score', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var eventsDir, allReportFiles, scoreResultReportFile, scoreResultContent, scoreResult;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    eventsDir = path.resolve(__dirname, '..', 'reports', 'mutation', 'events');
                    return [4 /*yield*/, fs.readdir(eventsDir)];
                case 1:
                    allReportFiles = _a.sent();
                    scoreResultReportFile = allReportFiles.find(function (file) { return !!file.match(/.*onScoreCalculated.*/); });
                    chai_1.expect(scoreResultReportFile).ok;
                    return [4 /*yield*/, fs.readFile(path.resolve(eventsDir, scoreResultReportFile || ''), 'utf8')];
                case 2:
                    scoreResultContent = _a.sent();
                    scoreResult = JSON.parse(scoreResultContent);
                    chai_1.expect(scoreResult.killed).eq(2);
                    chai_1.expect(scoreResult.survived).eq(8);
                    chai_1.expect(scoreResult.mutationScore).to.equal(20);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=verify.js.map