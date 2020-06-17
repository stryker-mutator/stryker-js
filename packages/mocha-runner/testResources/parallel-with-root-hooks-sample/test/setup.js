exports.mochaHooks = {
  beforeEach() {
    global.add = (a, b) => a + b;
  }
}
