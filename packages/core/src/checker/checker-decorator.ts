import { CheckResult } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';

import { ChildProcessCrashedError } from '../child-proxy/child-process-crashed-error';
import { ResourceDecorator } from '../concurrent';

import { CheckerResource } from './checker-resource';

export class CheckerDecorator extends ResourceDecorator<CheckerResource> {
  public async check(mutant: Mutant): Promise<CheckResult> {
    try {
      return await this.innerResource.check(mutant);
    } catch (err) {
      if (err instanceof ChildProcessCrashedError) {
        await this.recover();
        return this.innerResource.check(mutant);
      } else {
        throw err; //oops
      }
    }
  }
}
