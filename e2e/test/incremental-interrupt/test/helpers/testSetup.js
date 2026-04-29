import { expect } from 'chai';
export const mochaHooks = {
  beforeAll() {
    global.expect = expect;
  }
}
