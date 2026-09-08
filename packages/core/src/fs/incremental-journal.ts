import path from 'path';
import { appendFileSync, promises as fs } from 'fs';

import { StrykerOptions, schema } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { ERROR_CODES, isErrnoException } from '@stryker-mutator/util';

import { fileUtils } from '../utils/file-utils.js';

/**
 * A report-schema mutant plus the file it belongs to.
 * JSONL lines use this shape so `load()` can merge them onto `files[fileName].mutants`
 * while keeping remapped test IDs from `toMutantResult()`.
 */
export interface IncrementalJournalMutant extends schema.MutantResult {
  fileName: string;
}

export const INCREMENTAL_PENDING_BASE = 'base.json';
export const INCREMENTAL_PENDING_RESULTS = 'results.jsonl';

/**
 * Directory next to `incrementalFile` that holds the in-progress write-ahead log.
 * Example: `reports/stryker-incremental.json` → `reports/stryker-incremental.json.pending`.
 *
 * Appends rather than replacing the extension (like {@link incrementalTempFile}) so the
 * result is always longer than `incrementalFile`. Replacing it would map
 * `incrementalFile: "x.pending"` onto the report itself, and `begin()` would swap a
 * directory over the user's report; it would also give `a.json` and `a.html` one shared WAL.
 *
 * Separators are preserved for filesystem use; callers that match these as globs normalize
 * them first, because minimatch reads a backslash as an escape.
 */
export function incrementalPendingDir(incrementalFile: string): string {
  return `${incrementalFile}.pending`;
}

/**
 * Gitignore glob for the incremental report and its WAL siblings.
 * Example: `reports/stryker-incremental.json` → `reports/stryker-incremental.*`
 */
export function incrementalGitignorePattern(incrementalFile: string): string {
  return `${stripExtension(incrementalFile)}.*`;
}

function stripExtension(fileName: string): string {
  const ext = path.extname(fileName);
  return ext ? fileName.slice(0, -ext.length) : fileName;
}

/**
 * Staging directory used while replacing the pending pair. Must not be mixed with
 * an old `results.jsonl` (that would pair a new test-ID namespace with old journal lines).
 */
export function incrementalPendingNextDir(incrementalFile: string): string {
  return `${incrementalPendingDir(incrementalFile)}.next`;
}

/**
 * Previous pending directory renamed aside during an atomic swap.
 */
export function incrementalPendingPrevDir(incrementalFile: string): string {
  return `${incrementalPendingDir(incrementalFile)}.prev`;
}

/**
 * Temp file used while replacing `incrementalFile` via write + rename.
 * Example: `reports/stryker-incremental.json` → `reports/stryker-incremental.json.tmp`.
 */
export function incrementalTempFile(incrementalFile: string): string {
  return `${incrementalFile}.tmp`;
}

/**
 * Sibling paths of `incrementalFile` that must not be copied into the sandbox
 * or treated as source: the pending WAL dirs and the compact temp file.
 */
export function incrementalIgnorePaths(incrementalFile: string): string[] {
  return [
    incrementalPendingDir(incrementalFile),
    incrementalPendingNextDir(incrementalFile),
    incrementalPendingPrevDir(incrementalFile),
    incrementalTempFile(incrementalFile),
  ];
}

/**
 * Write-ahead log for `--incremental` runs.
 *
 * `stryker-incremental.json` is committed state. A sibling `.pending/` directory
 * holds a `MutationTestResult` taken before the checkers and test runners run
 * mutants (`base.json`) plus a JSONL of results completed after that
 * (`results.jsonl`).
 *
 * The next `--incremental` run recovers pending files through the normal
 * `IncrementalDiffer` path. Append is a no-op until `begin()` commits the new pair.
 * JSONL lines are written with `appendFileSync` so a crash in the same tick as
 * `onMutantTested` still sees the completed mutant.
 *
 * `isStarted` is true only after this process's `begin()` committed a pending pair.
 * The unexpected-exit handler uses that so Ctrl+C before `begin()` cannot compact
 * a recovered WAL from a prior crash into a truncated `incremental.json`.
 *
 * Not safe for two Stryker processes in the same project directory: `append`
 * resolves `pending/results.jsonl` by path, so a second run's `begin()` can
 * redirect the first run's appends into a different test-ID namespace. That is
 * the same class of race as sharing the sandbox / `incremental.json`.
 */
export class IncrementalJournal {
  public static inject = tokens(commonTokens.options, commonTokens.logger);

  private readonly incrementalFile: string;
  private readonly pendingDir: string;
  private readonly pendingNextDir: string;
  private readonly pendingPrevDir: string;
  private readonly enabled: boolean;

  /**
   * True after `begin()` has committed this run's pending pair, until `complete()`
   * or `close()`. `append()` is a no-op while this is false.
   */
  public isStarted = false;

  /**
   * Set once `append()` has warned. A broken pending directory would otherwise
   * produce one warning per remaining mutant.
   */
  private appendFailureLogged = false;

  /**
   * The `.prev` / `.next` directory `load()` recovered from. That directory
   * holds the only on-disk WAL until `begin()` commits a new pending pair, so
   * `commitPendingPair` stages into the other staging directory and skips
   * wiping this one. Cleared once the new pair is durable.
   */
  private walPreserveDir: string | undefined;

  constructor(
    options: Pick<StrykerOptions, 'incremental' | 'incrementalFile'>,
    private readonly log: Logger,
  ) {
    this.enabled = options.incremental;
    this.incrementalFile = options.incrementalFile;
    this.pendingDir = incrementalPendingDir(this.incrementalFile);
    this.pendingNextDir = incrementalPendingNextDir(this.incrementalFile);
    this.pendingPrevDir = incrementalPendingPrevDir(this.incrementalFile);
  }

  /**
   * Recover a previous in-progress run from pending files.
   * Does not read `incremental.json` — callers fall back to that themselves.
   *
   * Tries `pending/`, then `.prev`, then `.next`. A crash during the directory
   * swap can leave the durable pair in `.prev` (old WAL) or `.next` (new base,
   * no old pending existed) instead of `pending/`. Nothing is moved on disk:
   * recovering from `.prev` / `.next` only records {@link walPreserveDir}, which
   * makes `begin()` stage the new pair in the other directory instead of wiping
   * the only copy.
   *
   * Best-effort like the rest of the journal: a directory that cannot be read
   * (EACCES/EBUSY on a locked file) is skipped rather than failing the run.
   * @returns The merged report, or `undefined` if no pending dir is usable.
   */
  public async load(): Promise<schema.MutationTestResult | undefined> {
    if (!this.enabled) {
      return;
    }
    for (const dir of [
      this.pendingDir,
      this.pendingPrevDir,
      this.pendingNextDir,
    ]) {
      let report: schema.MutationTestResult | undefined;
      try {
        report = await this.loadFromPendingDir(dir);
      } catch (error) {
        this.log.warn(
          'Failed to read the incremental journal at "%s"; trying the next pending location.',
          dir,
        );
        this.log.debug('Pending journal read error: %s', error);
        continue;
      }
      if (report) {
        this.walPreserveDir = dir === this.pendingDir ? undefined : dir;
        this.log.info(
          'Recovering incremental results from pending journal at "%s".',
          dir,
        );
        return report;
      }
    }
    return;
  }

  /**
   * Commit `base.json` + an empty `results.jsonl` as the new pending pair, then
   * accept `append()` calls. `isStarted` becomes true once the staging directory
   * has been renamed to `pending`; leftover staging cleanup cannot disable appends.
   */
  public async begin(base: schema.MutationTestResult): Promise<void> {
    if (!this.enabled) {
      return;
    }
    this.isStarted = false;
    this.appendFailureLogged = false;

    try {
      await this.commitPendingPair(base);
      this.isStarted = true;
    } catch (error) {
      this.isStarted = false;
      this.log.warn(
        'Failed to start the incremental journal at "%s". Completed mutants from this run may be lost if the process dies.',
        this.pendingDir,
      );
      this.log.debug('Incremental journal begin error: %s', error);
    }
  }

  /**
   * Append a post-boundary mutant result. No-op before `begin()` / after `complete()`.
   * Writes synchronously so `onMutantTested` observers (and a crash in the same
   * tick) can see the JSONL line.
   */
  public append(result: IncrementalJournalMutant): void {
    if (!this.isStarted) {
      return;
    }
    try {
      appendFileSync(
        path.join(this.pendingDir, INCREMENTAL_PENDING_RESULTS),
        `${JSON.stringify(result)}\n`,
        'utf-8',
      );
    } catch (error: unknown) {
      if (!this.appendFailureLogged) {
        this.appendFailureLogged = true;
        this.log.warn(
          'Failed to append a mutant result to the incremental journal, further append failures will not be logged: %s',
          error,
        );
      }
    }
  }

  /**
   * Write the committed incremental file via temp + rename, then delete pending.
   * Never removes the WAL until the committed file is in place. Pending-dir
   * cleanup is best-effort so a locked leftover dir cannot fail the run.
   */
  public async complete(finalReport: schema.MutationTestResult): Promise<void> {
    if (!this.enabled) {
      return;
    }
    this.isStarted = false;
    this.walPreserveDir = undefined;
    await this.writeCommittedReport(finalReport);
    await this.removeDirBestEffort(this.pendingDir);
    await this.removeDirBestEffort(this.pendingNextDir);
    await this.removeDirBestEffort(this.pendingPrevDir);
  }

  /**
   * Stop accepting appends.
   * Production runs call `complete()` instead; tests use this to release files.
   */
  public close(): void {
    this.isStarted = false;
  }

  /**
   * Write a new `base.json` + empty `results.jsonl` into a staging directory,
   * then swap that directory into place as `pending`.
   *
   * Staging prefers `.next`. When `load()` recovered from `.next`, that directory
   * holds the only WAL, so staging uses `.prev` instead and `begin()` never
   * deletes the recovered copy before the new pair is durable. Crash before the
   * swap leaves the old pair; crash after leaves the new base with an empty
   * journal. A crash between the two renames leaves recoverable state in
   * `.prev` / `.next`; `load()` finds those. Cleanup after the swap is
   * best-effort so a locked leftover dir cannot leave `isStarted` false.
   */
  private async commitPendingPair(
    base: schema.MutationTestResult,
  ): Promise<void> {
    const stagingDir =
      this.walPreserveDir === this.pendingNextDir
        ? this.pendingPrevDir
        : this.pendingNextDir;
    const asideDir =
      stagingDir === this.pendingNextDir
        ? this.pendingPrevDir
        : this.pendingNextDir;

    await fs.rm(stagingDir, { recursive: true, force: true });
    await fs.mkdir(stagingDir, { recursive: true });
    await fs.writeFile(
      path.join(stagingDir, INCREMENTAL_PENDING_BASE),
      // Machine-only WAL file, so skip pretty-printing. It embeds every mutated
      // file's source and is rewritten on every incremental run; the committed
      // report stays indented because people read and diff that one.
      JSON.stringify(base),
      'utf-8',
    );
    await fs.writeFile(
      path.join(stagingDir, INCREMENTAL_PENDING_RESULTS),
      '',
      'utf-8',
    );

    // Free aside for renaming pending into it — unless aside holds the preserved
    // WAL. Staging already holds a complete pair by now, so this skip is not
    // what keeps the run recoverable; it keeps the *recovered* results on disk
    // until the swap lands, instead of trusting `base` to carry them forward.
    if (this.walPreserveDir !== asideDir) {
      await fs.rm(asideDir, { recursive: true, force: true });
    }

    try {
      await fs.rename(this.pendingDir, asideDir);
    } catch (error: unknown) {
      if (isNoSuchFileOrDirectory(error)) {
        // No pending directory to move aside.
      } else if (this.walPreserveDir === asideDir) {
        // Aside holds the recovered WAL, so it cannot receive pending. Drop an
        // unusable pending (if any) so staging can take its place. If pending is
        // still locked, the staging rename below throws and begin() fails — the
        // preserved WAL remains intact.
        await this.removeDirBestEffort(this.pendingDir);
      } else {
        throw error;
      }
    }

    await fs.rename(stagingDir, this.pendingDir);
    // New pending is durable. Safe to drop the old recovered WAL and staging leftovers.
    this.walPreserveDir = undefined;
    await this.removeDirBestEffort(this.pendingPrevDir);
    await this.removeDirBestEffort(this.pendingNextDir);
  }

  /**
   * `force: true` already ignores a missing path. Other errors (EPERM/EBUSY on
   * Windows) still throw; those must not undo a rename/write that already landed.
   */
  private async removeDirBestEffort(dir: string): Promise<void> {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      this.log.debug(
        'Failed to remove incremental journal path "%s": %s',
        dir,
        error,
      );
    }
  }

  private async writeCommittedReport(
    report: schema.MutationTestResult,
  ): Promise<void> {
    await fs.mkdir(path.dirname(this.incrementalFile), { recursive: true });
    const tempFile = incrementalTempFile(this.incrementalFile);
    await fs.writeFile(tempFile, JSON.stringify(report, null, 2), 'utf-8');
    await replaceFile(tempFile, this.incrementalFile);
  }

  /**
   * Read and merge `base.json` + `results.jsonl` from one pending directory.
   * @returns The merged report, or `undefined` if this directory is missing or unusable.
   */
  private async loadFromPendingDir(
    dir: string,
  ): Promise<schema.MutationTestResult | undefined> {
    const basePath = path.join(dir, INCREMENTAL_PENDING_BASE);
    let baseRaw: string;
    try {
      baseRaw = await fs.readFile(basePath, 'utf-8');
    } catch (error: unknown) {
      if (isNoSuchFileOrDirectory(error)) {
        return;
      }
      throw error;
    }

    let base: schema.MutationTestResult;
    try {
      base = JSON.parse(baseRaw) as schema.MutationTestResult;
    } catch (error) {
      this.log.warn(
        'Incremental pending base at "%s" is not valid JSON; trying the next pending location.',
        basePath,
      );
      this.log.debug('Pending base parse error: %s', error);
      return;
    }

    const journalMutants = await this.readResultsJsonl(dir);
    if (journalMutants === undefined) {
      return;
    }

    for (const { fileName, ...mutant } of journalMutants) {
      const fileResult = base.files[fileName];
      if (fileResult) {
        fileResult.mutants.push(mutant);
      } else {
        base.files[fileName] = {
          language: fileUtils.determineLanguage(fileName),
          source: '',
          mutants: [mutant],
        };
      }
    }
    return base;
  }

  /**
   * Parse JSONL. A malformed last line (torn write) is dropped. A malformed
   * interior line fails the whole load so callers can fall back to another pending
   * dir or the committed file.
   * @returns Parsed mutants, or `undefined` when this journal must not be used.
   */
  private async readResultsJsonl(
    dir: string,
  ): Promise<IncrementalJournalMutant[] | undefined> {
    const resultsPath = path.join(dir, INCREMENTAL_PENDING_RESULTS);
    let raw: string;
    try {
      raw = await fs.readFile(resultsPath, 'utf-8');
    } catch (error: unknown) {
      if (isNoSuchFileOrDirectory(error)) {
        return [];
      }
      throw error;
    }

    const lines = raw.split('\n');
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    const mutants: IncrementalJournalMutant[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLast = i === lines.length - 1;
      try {
        mutants.push(JSON.parse(line) as IncrementalJournalMutant);
      } catch (error) {
        if (isLast) {
          this.log.debug(
            'Dropping a torn last line from incremental journal "%s".',
            resultsPath,
          );
          break;
        }
        this.log.warn(
          'Incremental pending journal at "%s" has a corrupted interior line; trying the next pending location.',
          resultsPath,
        );
        this.log.debug('Pending JSONL parse error: %s', error);
        return;
      }
    }
    return mutants;
  }
}

async function replaceFile(from: string, to: string): Promise<void> {
  try {
    await fs.rename(from, to);
  } catch (error: unknown) {
    if (isReplaceRaceError(error)) {
      await fs.rm(to, { force: true });
      await fs.rename(from, to);
      return;
    }
    throw error;
  }
}

function isNoSuchFileOrDirectory(error: unknown): boolean {
  if (!isErrnoException(error)) {
    return false;
  }
  return error.code === ERROR_CODES.NoSuchFileOrDirectory;
}

function isReplaceRaceError(error: unknown): boolean {
  if (!isErrnoException(error)) {
    return false;
  }
  return (
    error.code === 'EEXIST' || error.code === 'EPERM' || error.code === 'EACCES'
  );
}
