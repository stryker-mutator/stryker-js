import { EventEmitter } from 'events';

export default class ChildProcessMock extends EventEmitter {

  public stdout = new EventEmitter();
  public stderr = new EventEmitter();

  constructor(readonly pid: number) {
    super();
  }
}
