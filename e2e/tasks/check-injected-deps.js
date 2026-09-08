import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';

/**
 * Workspace packages listed as `injected` in `dependenciesMeta` are hard-linked *copies* of
 * their build output rather than symlinks to the package, linked when `pnpm install` runs.
 *
 * A build that overwrites the existing output in place keeps those links, so the copies do
 * see the change. What breaks a link is recreating the file: `pnpm run clean` removes `dist`,
 * so the next build writes fresh inodes and the copies stay pinned to the previous build.
 * Without this check the e2e tests then silently exercise whatever was built the last time
 * `pnpm install` ran, and both passes and failures are meaningless.
 *
 * `pnpm install` re-links the copies; CI does it in its "install build output" step.
 */

const e2eRoot = fileURLToPath(new URL('..', import.meta.url));
const packagesRoot = path.join(e2eRoot, '..', 'packages');

/**
 * Relative paths of every file under `dir`.
 * @param {string} dir
 * @returns {string[]}
 */
function filesIn(dir) {
  /** @type {string[]} */
  const found = [];
  /** @param {string} current */
  const walk = (current) => {
    /** @type {fs.Dirent[]} */
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return; // Missing or unreadable: nothing to compare.
    }
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else {
        found.push(path.relative(dir, entryPath));
      }
    }
  };
  walk(dir);
  return found;
}

/**
 * @param {string} file
 * @returns {string}
 */
function hash(file) {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
}

/**
 * True when the built package no longer matches the copy the e2e tests resolve.
 *
 * Only files present in the copy are compared: `dist` also holds `*.tsbuildinfo` and
 * compiled tests, which are never published and so are legitimately absent. Identical
 * inodes mean the hard link still stands, which is the common case and costs one `stat`.
 *
 * Known gap: a source file added since the last install has no counterpart in the copy and
 * so goes unreported. Comparing the other direction would mean deriving each package's
 * publishable subset from its `files` field. A clean rebuild replaces every inode and is
 * caught regardless, which is the case this check exists for.
 *
 * @param {string} sourceDist
 * @param {string} injectedDist
 * @returns {boolean}
 */
function isStale(sourceDist, injectedDist) {
  return filesIn(injectedDist).some((relative) => {
    const injectedFile = path.join(injectedDist, relative);
    const sourceFile = path.join(sourceDist, relative);
    try {
      const injectedStat = fs.statSync(injectedFile);
      const sourceStat = fs.statSync(sourceFile);
      if (injectedStat.ino !== 0 && injectedStat.ino === sourceStat.ino) {
        return false; // Still hard-linked, so identical by construction.
      }
      if (injectedStat.size !== sourceStat.size) {
        return true;
      }
      return hash(injectedFile) !== hash(sourceFile);
    } catch {
      return false; // A file only the copy has is pnpm's business, not a rebuild signal.
    }
  });
}

/**
 * Workspace packages that e2e resolves through an injected copy.
 * @returns {{ name: string, sourceDist: string, injectedDist: string }[]}
 */
function injectedPackages() {
  /** @type {{ dependenciesMeta?: Record<string, { injected?: boolean }> }} */
  const e2ePackage = JSON.parse(
    fs.readFileSync(path.join(e2eRoot, 'package.json'), 'utf-8'),
  );
  const dependenciesMeta = e2ePackage.dependenciesMeta ?? {};
  /** @type {Map<string, string>} */
  const sourceDirByName = new Map();
  for (const dir of fs.readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!dir.isDirectory()) {
      continue;
    }
    const packageDir = path.join(packagesRoot, dir.name);
    try {
      /** @type {{ name?: string }} */
      const { name } = JSON.parse(
        fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
      );
      if (name) {
        sourceDirByName.set(name, packageDir);
      }
    } catch {
      // Not a package directory.
    }
  }

  return Object.entries(dependenciesMeta)
    .filter(([, meta]) => meta?.injected)
    .map(([name]) => ({ name, sourceDir: sourceDirByName.get(name) }))
    .filter((pkg) => pkg.sourceDir !== undefined)
    .map(({ name, sourceDir }) => ({
      name,
      sourceDist: path.join(sourceDir, 'dist'),
      injectedDist: path.join(e2eRoot, 'node_modules', name, 'dist'),
    }));
}

/**
 * Fail fast when a package was rebuilt after the injected copies were last linked.
 * Set `SKIP_INJECTED_DEPS_CHECK=1` to bypass.
 */
export function checkInjectedDeps() {
  if (process.env.SKIP_INJECTED_DEPS_CHECK) {
    return;
  }
  const stale = injectedPackages().filter(({ sourceDist, injectedDist }) =>
    isStale(sourceDist, injectedDist),
  );

  if (stale.length) {
    throw new Error(
      'These packages were rebuilt after the e2e copies were linked, so the e2e tests would run the older build:\n' +
        stale.map(({ name }) => `  - ${name}`).join('\n') +
        '\n\nRun `pnpm install --frozen-lockfile` from the repo root to re-link them, then run the tests again.\n' +
        '(`pnpm run e2e` does this for you. Set SKIP_INJECTED_DEPS_CHECK=1 to bypass this check.)',
    );
  }
}
