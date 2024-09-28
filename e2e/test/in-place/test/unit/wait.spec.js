import { existsSync } from 'fs';
import path from 'path';

describe('wait', () => {
  it('should wait until `.lock` is removed', async () => {
    while (existsSync(new URL('../../.lock', import.meta.url))) {
      await sleep(10);
    }
  });
});
async function sleep(n) {
  return new Promise((res) => setTimeout(res, n));
}
