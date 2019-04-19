
declare interface MochaOptions {
  require?: string[];
  opts?: string;
  config?: string;
  package?: string;
  timeout?: number;
  asyncOnly?: boolean;
  ui?: string;
  files?: string[] | string;
  grep?: RegExp;
  extension?: string[];
}
