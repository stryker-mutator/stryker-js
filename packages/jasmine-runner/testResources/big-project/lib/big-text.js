
// Change the text each iteration to prevent nodejs from optimizing it into one value on the heap
if (!global.n) {
  global.n = 300000;
}
module.exports.text = new Array(global.n++).fill('i').join(',');
