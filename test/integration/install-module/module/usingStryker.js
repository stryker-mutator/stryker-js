"use strict";
var stryker_1 = require('stryker');
new stryker_1.default(['mutateFiles: string[]'], ['allFiles: string[]']).runMutationTest().then(function () { return console.log('done'); });
