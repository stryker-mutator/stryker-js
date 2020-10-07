import * as childProcess from 'child_process';
import { promisify } from 'util';

export default {
  exec: promisify(childProcess.exec),
};
