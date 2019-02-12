import { StatementMap } from '@stryker-mutator/api/test_runner';

interface FileStatements {
  path: string;
  statements: StatementMap;
}

export default FileStatements;
