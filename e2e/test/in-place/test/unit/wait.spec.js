import { existsSync } from 'fs';
import path from 'path';

describe('wait', () => {
  it('should wait until `.lock` is removed', async () => {
    while (existsSync(path.resolve(import.meta.dirname, '..', '..', '.lock'))) {
      await sleep(10);
    }
  });
});
async function sleep(n) {
  return new Promise((res) => setTimeout(res, n));
}
