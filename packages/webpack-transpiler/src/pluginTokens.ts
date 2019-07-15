
function stringLiteral<T extends string>(literal: T) {
  return literal;
}

export const PLUGIN_TOKENS = Object.freeze({
  configLoader: stringLiteral('configLoader'),
  require: stringLiteral('require')
});
