import { CheckResult } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';

import { ChildProcessCrashedError } from '../child-proxy/child-process-crashed-error.js';
import { ResourceDecorator } from '../concurrent/index.js';

import { CheckerResource } from './checker-resource.js';

export class CheckerDecorator extends ResourceDecorator<CheckerResource> {
  public async check(checkerIndex: number, mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    try {
      return await this.innerResource.check(checkerIndex, mutants);
    } catch (err) {
      if (err instanceof ChildProcessCrashedError) {
        await this.recover();
        return this.innerResource.check(checkerIndex, mutants);
      } else {
        throw err; //oops
      }
    }
  }
}
