import { expect } from 'chai';

import { print } from '../../../src/printers/js-printer.js';
import { printerContextStub } from '../../helpers/stubs.js';
import { createJSAst } from '../../helpers/factories.js';
import { PrinterContext } from '../../../src/printers/index.js';

describe('js-printer', () => {
  let contextStub: sinon.SinonStubbedInstance<PrinterContext>;

  beforeEach(() => {
    contextStub = printerContextStub();
  });

  it('should be able to print js', () => {
    const actual = print(createJSAst({ rawContent: 'const foo = 42' }), contextStub);
    expect(actual).eq('const foo = 42;');
  });
});
