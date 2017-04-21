"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stryker_1 = require("stryker");
new stryker_1.default({ mutateFiles: [], allFiles: [], coverageAnalysis: 'off' }).runMutationTest().then(function () { return console.log('done'); });
