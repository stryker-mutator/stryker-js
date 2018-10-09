import * as childProcess from 'child_process';
import promisify from './promisify';

export default {
  exec: promisify(childProcess.exec)
};
