import os from 'os';
import fs from 'fs';

import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import { factory } from '@stryker-mutator/test-helpers';

class HealthyChecker implements Checker {
  public async init(): Promise<void> {
    // Init
  }

  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    const result: Record<string, CheckResult> = {};

    mutants.forEach(
      (mutant) =>
        (result[mutant.id] = mutant.id === '1' ? { status: CheckStatus.Passed } : { status: CheckStatus.CompileError, reason: 'Id is not 1 🤷‍♂️' })
    );

    return result;
  }
}

class CrashingChecker implements Checker {
  public async init(): Promise<void> {
    // Init
  }

  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    throw new Error('Always crashing');
  }
}

export class TwoTimesTheCharm implements Checker {
  public static COUNTER_FILE = `${os.tmpdir()}/stryker-js-two-times-the-charm-checker-file`;

  public async init(): Promise<void> {
    // Init
  }

  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    let count = +(await fs.promises.readFile(TwoTimesTheCharm.COUNTER_FILE, 'utf-8'));
    const result: Record<string, CheckResult> = {};

    for (const mutant of mutants) {
      count++;
      await fs.promises.writeFile(TwoTimesTheCharm.COUNTER_FILE, count.toString(), 'utf-8');

      if (count >= 2) {
        result[mutant.id] = { status: CheckStatus.Passed };
      } else {
        process.exit(count);
      }
    }

    return result;
  }
}

export class VerifyTitle implements Checker {
  public async init(): Promise<void> {
    // Init
  }

  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    const result: Record<string, CheckResult> = {};

    mutants.forEach(
      (mutant) =>
        (result[mutant.id] =
          mutant.fileName === process.title
            ? factory.checkResult({ status: CheckStatus.Passed })
            : factory.checkResult({ status: CheckStatus.CompileError }))
    );

    return result;
  }
}

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Checker, 'healthy', HealthyChecker),
  declareClassPlugin(PluginKind.Checker, 'crashing', CrashingChecker),
  declareClassPlugin(PluginKind.Checker, 'two-times-the-charm', TwoTimesTheCharm),
  declareClassPlugin(PluginKind.Checker, 'verify-title', VerifyTitle),
];
