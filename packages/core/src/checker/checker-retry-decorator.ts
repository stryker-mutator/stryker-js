import { CheckResult } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';

import { ChildProcessCrashedError } from '../child-proxy/child-process-crashed-error';
import { OutOfMemoryError } from '../child-proxy/out-of-memory-error';
import { ResourceDecorator } from '../concurrent';

import { CheckerResource } from './checker-resource';

export class CheckerRetryDecorator extends ResourceDecorator<CheckerResource> implements CheckerResource {
  constructor(producer: () => CheckerResource, private readonly log: Logger) {
    super(producer);
  }

  public async check(mutant: Mutant): Promise<CheckResult> {
    try {
      return await this.innerResource.check(mutant);
    } catch (error) {
      if (error instanceof ChildProcessCrashedError) {
        if (error instanceof OutOfMemoryError) {
          this.log.warn(`Checker process [${error.pid}] ran out of memory. Retrying in a new process.`);
        } else {
          this.log.warn(`Checker process [${error.pid}] crashed with exit code ${error.exitCode}. Retrying in a new process.`, error);
        }
        await this.recover();
        return this.innerResource.check(mutant);
      } else {
        throw error; //oops
      }
    }
  }

  public async checkGroup(mutants: Mutant[]): Promise<Array<{ mutant: Mutant; checkResult: CheckResult }>> {
    return this.innerResource.checkGroup?.(mutants) ?? [];
  }

  public async createGroups(mutants: Mutant[]): Promise<Mutant[][] | undefined> {
    return this.innerResource.createGroups?.(mutants);
  }
}
