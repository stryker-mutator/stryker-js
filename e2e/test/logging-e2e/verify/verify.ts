import fs from 'fs';
import { expect } from 'chai';

describe('Verify stryker passed logging correctly', () => {

  const strykerLog = fs.readFileSync('./stryker.log', 'utf-8');
  it('should have logged worker messages on trace level', () => {
    expect(strykerLog).matches(/TRACE CustomTestRunner trace \{.*"disableBail":false.*\}/);
    expect(strykerLog).contains('DEBUG CustomTestRunner test debug');
    expect(strykerLog).contains('INFO CustomTestRunner test info');
    expect(strykerLog).contains('WARN CustomTestRunner test warn');
    expect(strykerLog).contains('ERROR CustomTestRunner test error');
  });

  it('should have logged the PID if the worker process and main process', () => {
    const [,workerPid] = /\((\d+)\) ERROR CustomTestRunner test error/.exec(strykerLog);
    const [,mainPid] = /\((\d+)\) INFO Instrumenter/.exec(strykerLog);
    expect(parseInt(mainPid, 10)).gt(0);
    expect(parseInt(workerPid, 10)).gt(0);
    expect(workerPid).not.eq(mainPid);
  });
});
