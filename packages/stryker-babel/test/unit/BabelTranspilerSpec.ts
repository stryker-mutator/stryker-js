import BabelTranspiler from '../../src/BabelTranspiler';
import { expect } from 'chai';
import { Transpiler } from 'stryker-api/transpile';
import { Position } from 'stryker-api/core';

describe('BabelTranspiler', () => {
    let babelTranspiler: Transpiler;
    
    beforeEach(() => {
        babelTranspiler = new BabelTranspiler();
    });

    describe('Transpile', () => {
        it('Should throw a not implemented error', () => {
            expect(() => babelTranspiler.transpile(new Array())).to.throw(Error, 'Not implemented');
        });
    });

    describe('GetMappedLocation', () => {
        it('Should throw a not implemented error', () => {
            const position: Position = {
                line: 0,
                column: 0
            };
    
            const fileLocation: { fileName: string, start: Position, end: Position } = {
                fileName: 'test',
                start: position,
                end: position
            };
    
            expect(() => babelTranspiler.getMappedLocation(fileLocation)).to.throw(Error, 'Not implemented');
        });
    });
});