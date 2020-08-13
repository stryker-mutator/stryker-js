import * as childProcess from 'child_process';
import { promisify } from 'util';

export const childProcessAsPromised = {
  exec: promisify(childProcess.exec),
};
