"use strict";
var stryker_1 = require('stryker');
new stryker_1.default(['sourceFiles: string[]'], ['otherFiles: string[]']).runMutationTest(function () { return console.log('done'); });
