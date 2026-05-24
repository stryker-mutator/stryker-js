import generator from '@babel/generator';

import { TSAst, TsxAst } from '../syntax/index.js';

import { Printer } from './index.js';

const generate = generator.default ?? generator;

export const print: Printer<TSAst | TsxAst> = (file) => {
  return generate(file.root, {
    decoratorsBeforeExport: true,
    sourceMaps: false,
  }).code;
};
