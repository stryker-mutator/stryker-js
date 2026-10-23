import {
  AstFormat,
  TemplateScript,
  VueAst,
  VueRootNode,
  VueSetupScript,
} from '../syntax/index.js';

import { collectScriptBlocks } from './html-parser.js';
import { ParserContext } from './parser-context.js';

/**
 * Parses a Vue SFC. For now this is the script blocks only, the template is left
 * alone, which is why the block collection is reused from the html parser.
 */
export async function parse(
  text: string,
  fileName: string,
  context: ParserContext,
): Promise<VueAst> {
  const scriptBlocks = await collectScriptBlocks(text, fileName, context);

  let moduleScript: TemplateScript | undefined;
  let setup: VueSetupScript | undefined;
  const additionalScripts: TemplateScript[] = [];

  for (const block of scriptBlocks) {
    const script: TemplateScript = {
      ast: block.ast,
      range: block.range,
      isExpression: false,
    };
    /* The instrumentation header has to end up in a module level script, so a `<script setup>` can never be one */
    if (!moduleScript && !block.isSetup) {
      moduleScript = script;
    } else {
      additionalScripts.push(script);
    }
    if (block.isSetup && !setup) {
      setup = { script, lang: block.lang };
    }
  }

  const root: VueRootNode = { moduleScript, additionalScripts, setup };

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Vue,
    root,
  };
}
