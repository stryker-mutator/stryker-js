import {RunResult} from 'stryker-api/test_runner';

interface ResultMessageBody {
  result: RunResult;
}

export default ResultMessageBody;