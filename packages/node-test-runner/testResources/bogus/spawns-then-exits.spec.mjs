import { spawn } from 'node:child_process';

// A descendant that inherits our stdout keeps the pipe open after we exit, so
// the runner must notice the exit itself instead of waiting for the pipe.
spawn(process.execPath, ['-e', 'setTimeout(() => {}, 5000)'], {
  stdio: ['ignore', 'inherit', 'ignore'],
});
process.exit(1);
