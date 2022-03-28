import { Ast, AstFormat } from '../syntax/index.js';

import { print as htmlPrint } from './html-printer.js';
import { print as jsPrint } from './js-printer.js';
import { print as tsPrint } from './ts-printer.js';

export type Printer<T extends Ast> = (file: T, context: PrinterContext) => string;

export interface PrinterContext {
  print: Printer<Ast>;
}

export function print(file: Ast): string {
  const context: PrinterContext = {
    print,
  };
  switch (file.format) {
    case AstFormat.JS:
      return jsPrint(file, context);
    case AstFormat.TS:
      return tsPrint(file, context);
    case AstFormat.Tsx:
      return tsPrint(file, context);
    case AstFormat.Html:
      return htmlPrint(file, context);
  }
}
