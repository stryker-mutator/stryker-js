import { EventEmitter } from 'events';

export default class ChildProcessMock extends EventEmitter {

  public stderr = new EventEmitter();
  public stdout = new EventEmitter();

  constructor(public readonly pid: number) {
    super();
  }
}
