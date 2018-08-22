import * as sinon from 'sinon';

export default class LoggerStub {
  public error: sinon.SinonStub;
  public warn: sinon.SinonStub;
  public info: sinon.SinonStub;
  public debug: sinon.SinonStub;

  constructor() {
    this.error = sinon.stub();
    this.warn = sinon.stub();
    this.info = sinon.stub();
    this.debug = sinon.stub();
  }
}
