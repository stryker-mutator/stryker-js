import {RunOptions} from '../api/test_runner';

interface RunMessageBody {
  runOptions: RunOptions;
}

export default RunMessageBody;