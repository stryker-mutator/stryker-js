import { StatementMap } from 'stryker-api/test_runner';

interface FileStatements {
  path: string;
  statements: StatementMap;
}

export default FileStatements;