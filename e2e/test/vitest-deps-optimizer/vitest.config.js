import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Makes the race between test runner processes deterministic.
 *
 * When Vite optimizes dependencies, it checks whether the deps cache directory exists and then renames the processed result into place.
 * When two processes do this at the same time, the second rename fails with ENOTEMPTY (or EPERM on Windows).
 *
 * This holds the rename into the deps cache directory until a second process reaches the same point (or until the timeout),
 * so both processes have already decided the cache directory doesn't exist yet.
 * When test runners are (correctly) initialized one by one, the first process passes after the timeout and the others find the cache.
 */
const BARRIER_DIR = path.resolve('node_modules/.vite/deps-commit-barrier');
const BARRIER_PARTIES = 2;
const BARRIER_TIMEOUT_MS = 10_000;
const isDepsCacheDir = (to) => path.basename(String(to)) === 'deps___vitest__';

function arriveAtBarrier() {
  fs.mkdirSync(BARRIER_DIR, { recursive: true });
  fs.writeFileSync(path.join(BARRIER_DIR, String(process.pid)), '');
}
const barrierReached = () =>
  fs.readdirSync(BARRIER_DIR).length >= BARRIER_PARTIES;

const sleepSync = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

if (!fs.renameSync.strykerBarrier) {
  const { renameSync, rename } = fs;
  fs.renameSync = function (from, to) {
    if (isDepsCacheDir(to)) {
      arriveAtBarrier();
      const start = Date.now();
      while (!barrierReached() && Date.now() - start < BARRIER_TIMEOUT_MS) {
        sleepSync(50);
      }
    }
    return renameSync(from, to);
  };
  // Vite uses async `fs.rename` on Windows
  fs.rename = function (from, to, callback) {
    if (!isDepsCacheDir(to)) {
      return rename(from, to, callback);
    }
    arriveAtBarrier();
    const start = Date.now();
    const poll = () => {
      if (barrierReached() || Date.now() - start >= BARRIER_TIMEOUT_MS) {
        rename(from, to, callback);
      } else {
        setTimeout(poll, 50);
      }
    };
    poll();
  };
  fs.renameSync.strykerBarrier = true;
}

export default defineConfig({
  plugins: [
    {
      // Prebundle dependencies for server environments (including Vitest's), like `@sveltejs/vite-plugin-svelte` does.
      // Server environments optimize their explicitly included dependencies when the Vite server starts.
      name: 'optimize-server-deps',
      configEnvironment(name) {
        if (name !== 'client') {
          return { optimizeDeps: { include: ['semver', 'rxjs', 'minimatch'] } };
        }
      },
    },
  ],
  test: {
    include: ['tests/**/*.spec.js'],
  },
});
