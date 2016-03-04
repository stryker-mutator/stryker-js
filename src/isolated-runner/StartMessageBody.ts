import {RunnerOptions} from '../api/test_runner';

interface StartMessageBody {
  runnerName: string;
  runnerOptions: RunnerOptions;
}

export default StartMessageBody;