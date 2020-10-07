import generate from '@babel/generator';

import { JSAst } from '../syntax';

import { Printer } from '.';

export const print: Printer<JSAst> = (file) => {
  return generate(file.root, { sourceMaps: false }).code;
};
