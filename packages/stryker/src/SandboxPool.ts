import * as os from 'os';
import { getLogger } from 'log4js';
import { Observable } from 'rxjs';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import Sandbox from './Sandbox';

export default class SandboxPool {

  private readonly log = getLogger(SandboxPool.name);
  private readonly sandboxes: Sandbox[] = [];
  private isDisposed: boolean = false;

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

    const sandboxes = Observable.range(0, numConcurrentRunners)
      .flatMap(n => this.registerSandbox(Sandbox.create(this.options, n, this.initialFiles, this.testFramework)));
    return sandboxes;
  }

  private registerSandbox(promisedSandbox: Promise<Sandbox>): Promise<Sandbox> {
    return promisedSandbox.then(sandbox => {
      if (this.isDisposed) {
        // This sandbox is too late for the party. Dispose it to prevent hanging child processes
        // See issue #396
        sandbox.dispose();
      } else {
        this.sandboxes.push(sandbox);
      }
      return sandbox;
    });
  }

  public disposeAll() {
    this.isDisposed = true;
    return Promise.all(this.sandboxes.map(sandbox => sandbox.dispose()));
  }
}
