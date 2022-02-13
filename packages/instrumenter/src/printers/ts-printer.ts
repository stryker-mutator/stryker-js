import generator from '@babel/generator';

import { TSAst, TsxAst } from '../syntax/index.js';

import { Printer } from './index.js';

// @ts-expect-error CJS typings not in line with synthetic esm
const generate: typeof generator = generator.default;

export const print: Printer<TSAst | TsxAst> = (file) => {
  return generate(file.root, {
    decoratorsBeforeExport: true,
    sourceMaps: false,
  }).code;
};
