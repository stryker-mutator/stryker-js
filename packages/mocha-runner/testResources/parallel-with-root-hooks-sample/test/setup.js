export const mochaHooks = {
  beforeEach() {
    global.add = (a, b) => a + b;
  }
}
