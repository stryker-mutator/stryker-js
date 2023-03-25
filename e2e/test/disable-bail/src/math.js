{
  const add = (a, b) => a + b;

  globalThis.add = add;
  if (typeof exports === 'object') {
    exports.add = add;
  }
}
