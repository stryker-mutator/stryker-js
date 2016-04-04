/**
 * Represents a TestSelector which can select one or more tests to be executed.
 */
interface TestSelector {

  /**
   * Gets the paths to the file(s) that this TestSelector uses to select tests. 
   * These files should be included in a testrunner. 
   * Test selectors should create unique files (can be done using the /api/util/StrykerTempFolder utilies)
   * @returns The files that this TestSelector uses.
   */
  files(): string[];

  /**
   * Selects a set of tests from the pool of tests asynchronously by changing
   * the contents of the file(s) provided by the files() method.
   * @param id A list of testID's to select.
   * @returns A promise to eventually select the tests.
   */
  select(id: number[]): Promise<void>;
}

export default TestSelector;