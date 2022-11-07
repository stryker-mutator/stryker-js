import { SvelteAst } from '../syntax';

import { Printer } from './index.js';

export const print: Printer<SvelteAst> = (file) => {
  return generate(file.root, { sourceMaps: false }).code;
};
