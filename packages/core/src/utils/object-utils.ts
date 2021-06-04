import treeKill from 'tree-kill';
import { StrykerError, KnownKeys } from '@stryker-mutator/util';
import { WarningOptions } from '@stryker-mutator/api/core';

/**
 * A wrapper around `process.env` (for testability)
 */
export function getEnvironmentVariable(nameEnvironmentVariable: string): string | undefined {
  return process.env[nameEnvironmentVariable];
}

export function undefinedEmptyString(str: string | undefined): string | undefined {
  if (str) {
    return str;
  }
  return undefined;
}

export function getEnvironmentVariableOrThrow(name: string): string {
  const value = getEnvironmentVariable(name);
  if (value === undefined) {
    throw new StrykerError(`Missing environment variable "${name}"`);
  } else {
    return value;
  }
}

export function isWarningEnabled(warningType: KnownKeys<WarningOptions>, warningOptions: WarningOptions | boolean): boolean {
  if (typeof warningOptions === 'boolean') {
    return warningOptions;
  } else {
    return !!warningOptions[warningType];
  }
}

/**
 * A wrapper around `process.exitCode = n` (for testability)
 */
export function setExitCode(n: number): void {
  process.exitCode = n;
}

export function kill(pid: number | undefined): Promise<void> {
  return new Promise((res, rej) => {
    treeKill(pid!, 'SIGKILL', (err?: Error & { code?: number }) => {
      if (err && !canIgnore(err.code)) {
        rej(err);
      } else {
        res();
      }
    });

    function canIgnore(code: number | undefined) {
      // https://docs.microsoft.com/en-us/windows/desktop/Debug/system-error-codes--0-499-
      // these error codes mean the program is _already_ closed.
      return code === 255 || code === 128;
    }
  });
}

/**
 * Creates a random integer number.
 * @returns A random integer.
 */
export function random(): number {
  return Math.ceil(Math.random() * 10000000);
}
