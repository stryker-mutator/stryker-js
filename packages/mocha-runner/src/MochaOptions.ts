/**
 * This is a subset of all possible mocha options
 * Only those that come in handy for the mocha runner plugin.
 */
export interface MochaOptions {
  require?: string[];
  opts?: string;
  config?: string;
  package?: string;
  timeout?: number;
  asyncOnly?: boolean;
  ui?: string;
  files?: string[] | string;
  spec?: string[];
  grep?: RegExp;
  extension?: string[];
}
