import generate from '@babel/generator';

import { JSAst } from '../syntax/index.js';

import { Printer } from './index.js';

export const print: Printer<JSAst> = (file) => {
  return generate(file.root, { sourceMaps: false }).code;
};
