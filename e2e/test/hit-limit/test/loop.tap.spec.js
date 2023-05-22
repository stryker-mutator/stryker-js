const tap = require('tap');
const { loop } = require('../src/loop');

tap.test('loop should result in 15 for n=5 and a sum function', (t) => {
  let result = 0;
  loop(5, (n) => (result += n));
  t.equal(result, 15);
  t.end();
});
