export const instrumenterTokens = Object.freeze({
  createParser: 'instrumenterCreateParser',
  print: 'instrumenterPrint',
  transform: 'instrumenterTransform',
  mutators: 'instrumenterMutators',
  babelTransformer: 'instrumenterBabelTransformer',
  svelteTransformer: 'instrumenterSvelteTransformer',
  svelteTemplateExpressionContext:
    'instrumenterSvelteTemplateExpressionContext',
} as const);
