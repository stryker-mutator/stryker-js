import { CheckResult } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';

import { ChildProcessCrashedError } from '../child-proxy/child-process-crashed-error.js';
import { OutOfMemoryError } from '../child-proxy/out-of-memory-error.js';
import { ResourceDecorator } from '../concurrent/index.js';

import { CheckerResource } from './checker-resource.js';

export class CheckerRetryDecorator extends ResourceDecorator<CheckerResource> implements CheckerResource {
  constructor(producer: () => CheckerResource, private readonly log: Logger) {
    super(producer);
  }

  public async check(checkerIndex: number, mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    try {
      return await this.innerResource.check(checkerIndex, mutants);
    } catch (error) {
      if (error instanceof ChildProcessCrashedError) {
        if (error instanceof OutOfMemoryError) {
          this.log.warn(`Checker process [${error.pid}] ran out of memory. Retrying in a new process.`);
        } else {
          this.log.warn(`Checker process [${error.pid}] crashed with exit code ${error.exitCode}. Retrying in a new process.`, error);
        }
        await this.recover();
        return this.innerResource.check(checkerIndex, mutants);
      } else {
        throw error; //oops
      }
    }
  }
}
