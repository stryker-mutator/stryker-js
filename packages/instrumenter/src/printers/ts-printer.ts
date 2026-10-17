import generator from '@babel/generator';

import { TSAst, TsxAst } from '../syntax/index.js';

import { Printer } from './index.js';

export const print: Printer<TSAst | TsxAst> = (file) => {
  return generator(file.root, {
    sourceMaps: false,
  }).code;
};
