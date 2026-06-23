import {
  BaseContext,
  commonTokens,
  Injector,
  tokens,
} from '@stryker-mutator/api/plugin';

import { instrumenterTokens } from './instrumenter-tokens.js';
import { createParser } from './parsers/index.js';
import { print } from './printers/index.js';
import { createTransform } from './transformers/index.js';

import { Instrumenter } from './index.js';
import { createAllMutators } from './mutators/mutate.js';
import { createTransformBabel } from './transformers/babel-transformer.js';
import { createTransformSvelte } from './transformers/svelte-transformer.js';
import { SvelteTemplateExpressionContext } from './frameworks/svelte-template-expression-context.js';

export interface InstrumenterContext extends BaseContext {
  [instrumenterTokens.createParser]: typeof createParser;
  [instrumenterTokens.print]: typeof print;
  [instrumenterTokens.transform]: ReturnType<typeof createTransform>;

  [instrumenterTokens.mutators]: ReturnType<typeof createAllMutators>;
  [instrumenterTokens.babelTransformer]: ReturnType<
    typeof createTransformBabel
  >;
  [instrumenterTokens.svelteTransformer]: ReturnType<
    typeof createTransformSvelte
  >;
  [instrumenterTokens.svelteTemplateExpressionContext]: SvelteTemplateExpressionContext;
}

createInstrumenter.inject = tokens(commonTokens.injector);

export function createInstrumenter(
  injector: Injector<BaseContext>,
): Instrumenter {
  return injector
    .provideValue(instrumenterTokens.print, print)
    .provideValue(instrumenterTokens.createParser, createParser)
    .provideValue(
      instrumenterTokens.svelteTemplateExpressionContext,
      new SvelteTemplateExpressionContext(),
    )
    .provideFactory(instrumenterTokens.mutators, createAllMutators)
    .provideFactory(instrumenterTokens.babelTransformer, createTransformBabel)
    .provideFactory(instrumenterTokens.svelteTransformer, createTransformSvelte)
    .provideFactory(instrumenterTokens.transform, createTransform)
    .injectClass(Instrumenter);
}
