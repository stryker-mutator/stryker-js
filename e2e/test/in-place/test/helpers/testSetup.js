// @ts-nocheck
// 
// 
// 
// 
// 
// 
// 
exports.mochaHooks = {
  beforeAll() {
    global.expect = require('chai').expect;
  }
}
