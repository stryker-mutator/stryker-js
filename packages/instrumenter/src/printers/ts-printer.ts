import generate from '@babel/generator';

import { TSAst } from '../syntax';

import { Printer } from '.';

export const print: Printer<TSAst> = (file) => {
  return generate(file.root, {
    decoratorsBeforeExport: true,
    sourceMaps: false,
  }).code;
};
