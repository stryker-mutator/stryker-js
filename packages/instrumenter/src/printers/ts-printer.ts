import generate from '@babel/generator';

import { TSAst, TsxAst } from '../syntax';

import { Printer } from '.';

export const print: Printer<TSAst | TsxAst> = (file) => {
  return generate(file.root, {
    decoratorsBeforeExport: true,
    sourceMaps: false,
  }).code;
};
