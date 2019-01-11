
function token<T extends string>(value: T): T {
  return value;
}

const target: import('typed-inject').TargetToken = '$target';
const injector: import('typed-inject').InjectorToken = '$injector';

/**
 * Common tokens used for dependency injection (see typed-inject readme for more information)
 */
export const commonTokens = Object.freeze({
  /**
   * @deprecated Use 'options' instead. This is just hear to support plugin migration
   */
  config: token('config'),
  getLogger: token('getLogger'),
  injector,
  logger: token('logger'),
  options: token('options'),
  pluginResolver: token('pluginResolver'),
  produceSourceMaps: token('produceSourceMaps'),
  sandboxFileNames: token('sandboxFileNames'),
  target
});

/**
 * Helper method to create string literal tuple type.
 * @example
 * ```ts
 * const inject = tokens('foo', 'bar');
 * const inject2: ['foo', 'bar'] = ['foo', 'bar'];
 * ```
 * @param tokens The tokens as args
 */
export function tokens<TS extends string[]>(...tokens: TS): TS {
  return tokens;
}
