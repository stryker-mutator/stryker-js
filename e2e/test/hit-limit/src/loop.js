/**
 * This loop will result in an infinite loop when Stryker mutates it.
 */
function loop(n, action) {
  let goOn = true;
  while(goOn) {
    action(n);
    n--;
    goOn = n > 0;
  }
}

try{
  if(module?.exports){
    module.exports.loop = loop;
  }
} catch (err) { }
