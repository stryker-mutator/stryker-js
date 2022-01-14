import os from 'os';
import fs from 'fs';

import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { MutantTestCoverage } from '@stryker-mutator/api/core';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import { factory } from '@stryker-mutator/test-helpers';

class HealthyChecker implements Checker {
  public async init(): Promise<void> {
    // Init
  }

  public async check(mutants: MutantTestCoverage[]): Promise<Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }>> {
    return mutants.map((mutant) => ({
      checkResult: mutant.id === '1' ? { status: CheckStatus.Passed } : { status: CheckStatus.CompileError, reason: 'Id is not 1 🤷‍♂️' },
      mutant,
    }));
  }
}

class CrashingChecker implements Checker {
  public async init(): Promise<void> {
    // Init
  }

  public async check(mutants: MutantTestCoverage[]): Promise<Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }>> {
    throw new Error('Always crashing');
  }
}

export class TwoTimesTheCharm implements Checker {
  public static COUNTER_FILE = `${os.tmpdir()}/stryker-js-two-times-the-charm-checker-file`;

  public async init(): Promise<void> {
    // Init
  }

  public async check(mutants: MutantTestCoverage[]): Promise<Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }>> {
    let count = +(await fs.promises.readFile(TwoTimesTheCharm.COUNTER_FILE, 'utf-8'));
    const result: Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }> = [];

    for (const mutant of mutants) {
      count++;
      await fs.promises.writeFile(TwoTimesTheCharm.COUNTER_FILE, count.toString(), 'utf-8');

      if (count >= 2) {
        result.push({
          checkResult: { status: CheckStatus.Passed },
          mutant,
        });
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

  public async check(mutants: MutantTestCoverage[]): Promise<Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }>> {
    return mutants.map((mutant) => ({
      checkResult:
        mutant.fileName === process.title
          ? factory.checkResult({ status: CheckStatus.Passed })
          : factory.checkResult({ status: CheckStatus.CompileError }),
      mutant,
    }));
  }
}

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Checker, 'healthy', HealthyChecker),
  declareClassPlugin(PluginKind.Checker, 'crashing', CrashingChecker),
  declareClassPlugin(PluginKind.Checker, 'two-times-the-charm', TwoTimesTheCharm),
  declareClassPlugin(PluginKind.Checker, 'verify-title', VerifyTitle),
];
