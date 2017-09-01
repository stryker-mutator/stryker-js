import * as os from 'os';
import { getLogger } from 'log4js';
import { Observable } from 'rx';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import Sandbox from './Sandbox';

export default class SandboxCoordinator {

  private readonly log = getLogger(SandboxCoordinator.name);
  private readonly sandboxes: Sandbox[] = [];

  constructor(private options: Config, private testFramework: TestFramework | null, private initialFiles: File[]) {
  }

  public streamSandboxes(): Observable<Sandbox> {
    let numConcurrentRunners = os.cpus().length - 1;
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
      .map(n => new Sandbox(this.options, n, this.initialFiles, this.testFramework, null))
      .flatMap(sandbox => sandbox.initialize()
        .then(() => sandbox))
      .do(sandbox => this.registerSandbox(sandbox));
    return sandboxes;
  }

  private registerSandbox(sandbox: Sandbox) {
    this.sandboxes.push(sandbox);
  }

  public disposeAll() {
    return Promise.all(this.sandboxes.map(sandbox => sandbox.dispose()));
  }
}
