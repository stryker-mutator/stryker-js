function stringLiteral<T extends string>(literal: T) {
  return literal;
}

export const pluginTokens = Object.freeze({
  configLoader: stringLiteral('configLoader'),
  require: stringLiteral('require')
});
