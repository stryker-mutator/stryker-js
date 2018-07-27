import { EventEmitter } from 'events';

export default class ChildProcessMock extends EventEmitter {

  stdout = new EventEmitter();
  stderr = new EventEmitter();

  constructor(readonly pid: number) {
    super();
  }
}