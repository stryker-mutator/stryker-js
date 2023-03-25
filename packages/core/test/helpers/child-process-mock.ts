import { EventEmitter } from 'events';

export class ChildProcessMock extends EventEmitter {
  public stdout = new EventEmitter();
  public stderr = new EventEmitter();

  constructor(public readonly pid: number) {
    super();
  }
}
