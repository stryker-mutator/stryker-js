import { Factory, StrykerOptions } from '../../core';
import Reporter from './Reporter';
import Config from '../config/Config';

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
    public importSuggestion(name: string) {
      return `stryker-${name}-reporter`;
    }
  }

  const reporterFactoryInstance = new ReporterFactory();

  /**
   * Returns the current instance of the TestRunnerFactory.
   */
  export function instance() {
    return reporterFactoryInstance as Factory<Config, Reporter>;
  }
}

export default ReporterFactory;
