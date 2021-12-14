import { CheckResult } from '@stryker-mutator/api/check';
import { MutantTestCoverage } from '@stryker-mutator/api/core';

import { ChildProcessCrashedError } from '../child-proxy/child-process-crashed-error';
import { ResourceDecorator } from '../concurrent';

import { CheckerResource } from './checker-resource';

export class CheckerDecorator extends ResourceDecorator<CheckerResource> {
  public async check(mutants: MutantTestCoverage[]): Promise<Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }>> {
    try {
      return await this.innerResource.check(mutants);
    } catch (err) {
      if (err instanceof ChildProcessCrashedError) {
        await this.recover();
        return this.innerResource.check(mutants);
      } else {
        throw err; //oops
      }
    }
  }
}
