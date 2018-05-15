import { getLogger } from 'stryker-api/logging';
import * as os from 'os';
import { Observable, range } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import Sandbox from './Sandbox';

export default class SandboxPool {

  private readonly log = getLogger(SandboxPool.name);
  private readonly sandboxes: Promise<Sandbox>[] = [];

  constructor(private options: Config, private testFramework: TestFramework | null, private initialFiles: ReadonlyArray<File>) {
  }

  public streamSandboxes(): Observable<Sandbox> {
    let numConcurrentRunners = os.cpus().length;
    if (this.options.transpilers.length) {
      // If transpilers are configured, one core is reserved for the compiler (for now)
      numConcurrentRunners--;
    }
    let numConcurrentRunnersSource = 'CPU count';
    if (numConcurrentRunners > this.options.maxConcurrentTestRunners && this.options.maxConcurrentTestRunners > 0) {
      numConcurrentRunners = this.options.maxConcurrentTestRunners;
      numConcurrentRunnersSource = 'maxConcurrentTestRunners config';
    }
    if (numConcurrentRunners <= 0) {
      numConcurrentRunners = 1;
    }
    this.log.info(`Creating ${numConcurrentRunners} test runners (based on ${numConcurrentRunnersSource})`);

    const sandboxes = range(0, numConcurrentRunners)
      .pipe(flatMap(n => this.registerSandbox(Sandbox.create(this.options, n, this.initialFiles, this.testFramework))));
    return sandboxes;
  }

  private registerSandbox(promisedSandbox: Promise<Sandbox>): Promise<Sandbox> {
    this.sandboxes.push(promisedSandbox);
    return promisedSandbox;
  }

  public disposeAll() {
    return Promise.all(this.sandboxes.map(promisedSandbox => promisedSandbox.then(sandbox => sandbox.dispose())));
  }
}
