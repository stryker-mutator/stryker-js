"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinonChai = require("sinon-chai");
const sinon = require("sinon");
const test_helpers_1 = require("@stryker-mutator/test-helpers");
chai.use(sinonChai);
chai.use(chaiAsPromised);
afterEach(() => {
    sinon.restore();
    test_helpers_1.testInjector.reset();
});
//# sourceMappingURL=setupTests.js.map