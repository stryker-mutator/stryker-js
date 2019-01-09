
function token<T extends string>(value: T): T {
  return value;
}

export const commonTokens = Object.freeze({
  /**
   * @deprecated Use 'options' instead. This is just hear to support plugin migration
   */
  config: token('config'),
  getLogger: token('getLogger'),
  logger: token('logger'),
  options: token('options'),
  pluginResolver: token('pluginResolver'),
  produceSourceMaps: token('produceSourceMaps'),
  sandboxFileNames: token('sandboxFileNames')
});

export function tokens<TS extends string[]>(...tokens: TS): TS {
  return tokens;
}
