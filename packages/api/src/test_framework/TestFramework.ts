import TestSelection from './TestSelection';

/**
 * Represents a TestFramework which can select one or more tests to be executed.
 */
interface TestFramework {
  /**
   * Creates a code fragment which, if included in a test run,
   * is ran before a particular test is run.
   */
  beforeEach(codeFragment: string): string;

  /**
   * Creates a code fragment which, if included in a test run,
   * is ran before a particular test is run.
   */
  afterEach(codeFragment: string): string;

  /**
   * Creates a code fragment which, if included in a test run,
   * will be responsible for filtering out tests with given ids.
   * The first test gets id 0, the second id 1, etc.
   *
   * @param selections A list indicating the tests to select.
   * @returns A script which, if included in the test run, will filter out the correct tests.
   */
  filter(selections: TestSelection[]): string;
}

export default TestFramework;
