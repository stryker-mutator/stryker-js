import treeKill from 'tree-kill';
import { StrykerError, KnownKeys } from '@stryker-mutator/util';
import {
  Location,
  Position,
  schema,
  WarningOptions,
} from '@stryker-mutator/api/core';

export const objectUtils = {
  /**
   * Calls a defined callback function on each element of a map, and returns an array that contains the results.
   *
   * @param subject The map to act on
   * @param callbackFn The callback fn
   * @returns
   */
  map<K, V, R>(subject: Map<K, V>, callbackFn: (value: V, key: K) => R): R[] {
    const results: R[] = [];
    subject.forEach((value, key) => results.push(callbackFn(value, key)));
    return results;
  },

  /**
   * A wrapper around `process.env` (for testability)
   */
  getEnvironmentVariable(nameEnvironmentVariable: string): string | undefined {
    return process.env[nameEnvironmentVariable];
  },

  undefinedEmptyString(str: string | undefined): string | undefined {
    if (str) {
      return str;
    }
    return undefined;
  },

  getEnvironmentVariableOrThrow(name: string): string {
    const value = this.getEnvironmentVariable(name);
    if (value === undefined) {
      throw new StrykerError(`Missing environment variable "${name}"`);
    } else {
      return value;
    }
  },

  isWarningEnabled(
    warningType: KnownKeys<WarningOptions>,
    warningOptions: WarningOptions | boolean,
  ): boolean {
    if (typeof warningOptions === 'boolean') {
      return warningOptions;
    } else {
      return !!warningOptions[warningType];
    }
  },

  /**
   * A wrapper around `process.exitCode = n` (for testability)
   */
  setExitCode(n: number): void {
    process.exitCode = n;
  },

  kill(pid: number | undefined): Promise<void> {
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
  },

  /**
   * Converts an internal StrykerJS 0-based location to a schema.Location (1-based).
   * @param location the StrykerJS 0-based location
   * @returns the schema.Location (1-based)
   */
  toSchemaLocation(location: Location): schema.Location {
    return {
      end: this.toSchemaPosition(location.end),
      start: this.toSchemaPosition(location.start),
    };
  },

  /**
   * Converts an internal StrykerJS 0-based position to a schema.Position (1-based).
   * @param pos the StrykerJS 0-based position
   * @returns the schema.Position (1-based)
   */
  toSchemaPosition(pos: Position): schema.Position {
    return {
      column: pos.column + 1,
      line: pos.line + 1,
    };
  },
};
