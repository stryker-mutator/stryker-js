// @ts-nocheck
// 
// 
// 
// 
// 
const { existsSync } = require('fs');
const path = require('path');

describe('wait', () =>{
  it('should wait until `.lock` is removed', async () => {
    while(existsSync(path.resolve(__dirname, '..', '..', '.lock'))){
      await sleep(10);
    }
  });
})
async function sleep(n) {
  return new Promise(res => setTimeout(res, n));
}
