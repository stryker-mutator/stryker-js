import { expect } from 'chai';

import { PrinterContext } from '../../../src/printers';
import { print } from '../../../src/printers/js-printer';
import { createJSAst } from '../../helpers/factories';
import { printerContextStub } from '../../helpers/stubs';

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
