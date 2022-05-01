import { ESLint, Linter } from 'eslint';
import { CosmiconfigResult } from 'cosmiconfig/dist/types';

// Override some compiler options that have to do with code quality. When mutating, we're not interested in the resulting code quality
// See https://github.com/stryker-mutator/stryker-js/issues/391 for more info
const LINT_RULES_OVERRIDES: Readonly<Partial<Record<string, string>>> = Object.freeze({
  'no-unused-vars': 'off',
  'import/no-unresolved': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-empty-function': 'off',
});

/**
 * Overrides some options to speed up compilation and disable some code quality checks we don't want during mutation testing
 * @param parsedConfig The parsed config file
 */
function overrideOptions(parsedConfig: { config?: any }): Omit<Linter.Config, 'extends' | 'plugins'> {
  const rules = {
    ...parsedConfig.config?.rules,
    ...LINT_RULES_OVERRIDES,
  };

  const config = {
    ...parsedConfig.config,
    rules,
  };

  delete config.extends;
  delete config.plugins;

  return config;
}

interface ConfigLoader {
  load(filename: string): Promise<CosmiconfigResult>;
}

export async function getConfig(explorer: ConfigLoader, fileName?: string): Promise<ESLint.Options['overrideConfig']> {
  if (fileName) {
    const parsedConfig = await explorer.load(fileName);
    if (parsedConfig === null) {
      throw new Error(`Unable to parse ${fileName}, appears to be null`);
    }
    return overrideOptions(parsedConfig);
  }
  return overrideOptions({});
}
