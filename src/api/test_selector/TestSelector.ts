/**
 * Represents a TestSelector which can select one or more tests to be executed.
 */
interface TestSelector {

  /**
   * Gets the files that this TestSelector uses to select tests.
   * @returns The files that this TestSelector uses.
   */
  files(): string[];

  /**
   * Selects a set of tests from the pool of tests.
   * @param id A list of testID's to select.
   * @returns A promise to eventually select the tests.
   */
  select(id: number[]): Promise<void>;
}

export default TestSelector;