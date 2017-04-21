import * as sinon from 'sinon';

export default class LoggerStub {
  error: sinon.SinonStub;
  warn: sinon.SinonStub;
  info: sinon.SinonStub;
  debug: sinon.SinonStub;
  
  constructor() {
    this.error = sinon.stub();
    this.warn = sinon.stub();
    this.info = sinon.stub();
    this.debug = sinon.stub();
  }
}
