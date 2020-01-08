/**
 * Define a string literal.
 * @param value Token literal
 */
function stringLiteral<T extends string>(value: T): T {
  return value;
}

const target: import('typed-inject').TargetToken = '$target';
const injector: import('typed-inject').InjectorToken = '$injector';

/**
 * Common tokens used for dependency injection (see typed-inject readme for more information)
 */
export const commonTokens = Object.freeze({
  getLogger: stringLiteral('getLogger'),
  injector,
  logger: stringLiteral('logger'),
  mutatorDescriptor: stringLiteral('mutatorDescriptor'),
  options: stringLiteral('options'),
  pluginResolver: stringLiteral('pluginResolver'),
  produceSourceMaps: stringLiteral('produceSourceMaps'),
  sandboxFileNames: stringLiteral('sandboxFileNames'),
  httpClient: stringLiteral('httpClient'),
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
