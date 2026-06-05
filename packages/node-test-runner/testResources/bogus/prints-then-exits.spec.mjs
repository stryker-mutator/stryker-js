import test from 'node:test';
import fs from 'node:fs';

// `writeSync` targets the OS pipe buffer directly, so the output survives the
// immediate `process.exit` (an async `console.log` would be truncated). The
// exit happens before node:test reports `done`, so the run is observed as a
// crash — letting us assert the captured output is surfaced in the error.
test('writes to stdout and stderr, then exits', () => {
  fs.writeSync(1, 'STDOUT_MARKER_NTR\n');
  fs.writeSync(2, 'STDERR_MARKER_NTR\n');
  process.exit(1);
});
