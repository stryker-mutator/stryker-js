import { expect } from 'chai';

import { print } from '../../../src/printers/js-printer';
import { printerContextStub } from '../../helpers/stubs';
import { createJSAst } from '../../helpers/factories';
import { PrinterContext } from '../../../src/printers';

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
