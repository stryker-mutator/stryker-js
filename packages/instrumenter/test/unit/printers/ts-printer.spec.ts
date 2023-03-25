import { expect } from 'chai';
import babel from '@babel/core';

import { print } from '../../../src/printers/ts-printer.js';
import { createTSAst } from '../../helpers/factories.js';
import { printerContextStub } from '../../helpers/stubs.js';
import { PrinterContext } from '../../../src/printers/index.js';

const { types } = babel;

describe('ts-printer', () => {
  let contextStub: sinon.SinonStubbedInstance<PrinterContext>;

  beforeEach(() => {
    contextStub = printerContextStub();
  });

  it('should be able to print typescript', () => {
    // Arrange
    const input = "let foo: string = 'test';";

    // Act
    const output = print(createTSAst({ rawContent: input }), contextStub);

    // Assert
    expect(output).eq(input);
  });

  it('should be able to print annotations in typescript', () => {
    // Arrange
    const input = `
    @Component()
    export class AppComponent {}
    `
      .replace(/\n\s*/g, '\n')
      .trim();

    // Act
    const output = print(createTSAst({ rawContent: input }), contextStub);

    // Assert
    expect(output).eq(input);
  });

  it('should be able to print tsx', () => {
    // Arrange
    const input = types.file(
      types.program([
        types.variableDeclaration('const', [
          types.variableDeclarator(
            types.identifier('html'),
            types.jsxElement(
              types.jsxOpeningElement(types.jsxIdentifier('html'), []),
              types.jsxClosingElement(types.jsxIdentifier('html')),
              [],
              false
            )
          ),
        ]),
      ]),
      undefined,
      undefined
    );

    // Act
    const output = print(createTSAst({ root: input }), contextStub);

    // Assert
    expect(output).eq('const html = <html></html>;');
  });
});
