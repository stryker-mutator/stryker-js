import {Factory, StrykerOptions} from '../../core';
import Reporter from './Reporter';

namespace ReporterFactory {

  /**
   * Represents a Factory for Reporters.
   */
  class ReporterFactory extends Factory<StrykerOptions, Reporter> {
    constructor() {
      super('reporter');
    }

    /**
     * Returns the import suggestion for a Reporter
     * @param name The name of the Reporter the user tried to use.
     * @returns The name of the package the user may want to install (if it exists).
     */
    importSuggestion(name: string) {
      return `stryker-${name}-reporter`;
    }
  }

  let reporterFactoryInstance = new ReporterFactory();

  /**
   * Returns the current instance of the TestRunnerFactory.
   */
  export function instance() {
    return <Factory<StrykerOptions, Reporter>>reporterFactoryInstance;
  }
}

export default ReporterFactory;