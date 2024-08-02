import 'source-map-support/register.js';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

use(sinonChai);
use(chaiAsPromised);

let originalCwd: string;

// workaround for https://github.com/vitest-dev/vitest/issues/6187
let originalAfterEach: typeof globalThis.afterEach;

export const mochaHooks = {
  beforeEach(): void {
    originalCwd = process.cwd();
    // @ts-expect-error workaround for https://github.com/vitest-dev/vitest/issues/6187
    delete globalThis.afterEach;

    // Workaround for https://github.com/vitest-dev/vitest/issues/6187
    originalAfterEach = globalThis.afterEach;
  },

  afterEach(): void {
    sinon.restore();
    testInjector.reset();
    process.chdir(originalCwd);

    // Workaround for https://github.com/vitest-dev/vitest/issues/6187
    globalThis.afterEach = originalAfterEach;
  },
};
