// @ts-check
import Mocha from 'mocha';
import { promisify } from 'util';
import { loadRc } from 'mocha/lib/cli/options.js';
import path from 'path';
import { fileURLToPath } from 'node:url';

const m = new Mocha();

m.cleanReferencesAfterRun(false);

m.addFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src', 'my-math.spec.js'));
const run = promisify(m.run.bind(m))

async function main(){
  await m.loadFilesAsync();
  await run();
  await run();
}

main().catch(console.error);
