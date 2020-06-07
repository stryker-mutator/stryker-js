import { StrykerBabelConfig } from '../../src-generated/babel-transpiler-options';

export function createStrykerBabelConfig(overrides?: Partial<StrykerBabelConfig>): StrykerBabelConfig {
  return {
    extensions: ['.js', '.jsx', '.es6', '.es', '.mjs'],
    optionsFile: '.babelrc',
    options: {},
    ...overrides
  };
}
