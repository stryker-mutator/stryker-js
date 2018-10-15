"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stryker_1 = require("stryker");
new stryker_1.default({
    coverageAnalysis: 'off',
    files: [],
    mutate: [],
    testRunner: 'mocha'
}).runMutationTest().then(function () { return console.log('done'); });
//# sourceMappingURL=usingStryker.js.map