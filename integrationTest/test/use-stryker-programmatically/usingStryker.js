"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stryker_1 = require("stryker");
new stryker_1.default({
    testRunner: 'mocha',
    mutate: [],
    coverageAnalysis: 'off',
    files: []
}).runMutationTest().then(function () { return console.log('done'); });
