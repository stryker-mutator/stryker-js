import BabelTranspiler from '../../src/BabelTranspiler';
import { expect, assert } from 'chai';
import { File } from 'stryker-api/core';
import { Transpiler } from 'stryker-api/transpile';
import { Position, FileKind } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import * as babel from 'babel-core';
import { createFile } from '../helpers/producers';

describe('BabelTranspiler', () => {
    let babelTranspiler: Transpiler;
    let sandbox: sinon.SinonSandbox;
    let files: Array<File> = [];
    let transformStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        transformStub = sandbox.stub(babel, 'transform').callsFake((content) => {
            return {
                code: content
            };
        });

        babelTranspiler = new BabelTranspiler({config: new Config, keepSourceMaps: false});

        files = [
            createFile('sum', 'lkjghjk'),
            createFile('main', 'asdfasd'),
            createFile('lol', 'sretsd')
        ];
    });

    afterEach(() => sandbox.restore());

    describe('Transpile', () => {
        it('Should call the babel transform function with all given text files', async () => {
            const transpileResult = await babelTranspiler.transpile(files);

            expect(transpileResult.outputFiles).to.deep.equal(files);
        });

        it('Should not call the transform function with any file other than text files', async () => {
            files.push(createFile('binaryFile', 'asdgvfhaklsnd', FileKind.Binary));

            await babelTranspiler.transpile(files);

            assert(transformStub.callCount === 3);
        });

        it('Should return with an error when the babel transform fails', async () => {
            transformStub.callsFake(() => '');

            const transpileResult = await babelTranspiler.transpile(files);

            expect(transpileResult.outputFiles).to.be.empty;
            expect(transpileResult.error).to.deep.equal('Could not transpile file with the Babel transform function');
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