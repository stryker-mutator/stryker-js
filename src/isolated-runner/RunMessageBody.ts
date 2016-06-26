import {RunOptions} from 'stryker-api/test_runner';

interface RunMessageBody {
  runOptions: RunOptions;
}

export default RunMessageBody;