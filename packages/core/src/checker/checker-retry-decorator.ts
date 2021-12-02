import { CheckResult } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';

import { ChildProcessCrashedError } from '../child-proxy/child-process-crashed-error';
import { OutOfMemoryError } from '../child-proxy/out-of-memory-error';
import { ResourceDecorator } from '../concurrent';

import { CheckerResource } from './checker-resource';

export class CheckerRetryDecorator extends ResourceDecorator<CheckerResource> implements CheckerResource {
  // Save activeChecker for if a new checker has to spawn
  private activeChecker = '';

  constructor(producer: () => CheckerResource, private readonly log: Logger) {
    super(producer);
  }

  public async setActiveChecker(checker: string): Promise<void> {
    this.activeChecker = checker;
    await this.innerResource.setActiveChecker(checker);
  }

  public async check(mutants: Mutant[]): Promise<Array<{ mutant: Mutant; checkResult: CheckResult }>> {
    try {
      return await this.innerResource.check(mutants);
    } catch (error) {
      if (error instanceof ChildProcessCrashedError) {
        if (error instanceof OutOfMemoryError) {
          this.log.warn(`Checker process [${error.pid}] ran out of memory. Retrying in a new process.`);
        } else {
          this.log.warn(`Checker process [${error.pid}] crashed with exit code ${error.exitCode}. Retrying in a new process.`, error);
        }
        await this.recover();
        await this.innerResource.setActiveChecker(this.activeChecker);
        return this.innerResource.check(mutants);
      } else {
        throw error; //oops
      }
    }
  }

  public async createGroups(mutants: Mutant[]): Promise<Mutant[][] | undefined> {
    return this.innerResource.createGroups?.(mutants);
  }
}
