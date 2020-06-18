import { TypescriptOptions } from '../../src-generated/typescript-checker-options';

export function createTypescriptOptions(overrides?: Partial<TypescriptOptions>): TypescriptOptions {
  return {
    tsconfigFile: 'tsconfig.json',
    ...overrides,
  };
}
