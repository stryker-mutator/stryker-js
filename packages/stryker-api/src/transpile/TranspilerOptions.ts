import { Config } from '../../config';

export default interface TranspilerOptions {
  /**
   * The stryker config
   */
  config: Config;

  /**
   * Indicates whether or not the source maps need to be produced as part of the transpiler output.
   * If false, the transpiler may optimize to not calculate source maps.
   */
  produceSourceMaps: boolean;
}