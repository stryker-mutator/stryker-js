import { ESLint } from 'eslint';

// Override some compiler options that have to do with code quality. When mutating, we're not interested in the resulting code quality
// See https://github.com/stryker-mutator/stryker-js/issues/391 for more info
const LINT_RULES_OVERRIDES: Readonly<Partial<Record<string, string>>> = Object.freeze({
  'import/no-unresolved': 'off',
});

/**
 * Overrides some options to speed up compilation and disable some code quality checks we don't want during mutation testing
 * @param parsedConfig The parsed config file
 */
export function overrideOptions(parsedConfig: { config?: any }): ESLint.Options['overrideConfig'] {
  const rules = {
    ...parsedConfig.config?.rules,
    ...LINT_RULES_OVERRIDES,
  };

  return {
    ...parsedConfig.config,
    rules,
  };
}
