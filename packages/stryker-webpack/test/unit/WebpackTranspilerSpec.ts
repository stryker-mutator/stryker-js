import {expect, assert} from "chai";
import {Config} from "stryker-api/config";
import {TranspileResult} from "stryker-api/transpile";
import {Position, TextFile} from "stryker-api/core";
import {createTextFile} from "../helpers/producers";
import * as sinon from "sinon";
import WebpackTranspiler from "../../src/WebpackTranspiler";
import WebpackCompiler, * as webpackCompiler from "../../src/compiler/WebpackCompiler";

describe("WebpackTranspiler", () => {
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let webpackTranspiler: WebpackTranspiler;
    let webpackCompilerService: WebpackCompilerStubs;

    let fakeFileArray: Array<TextFile>;

    beforeEach(() => {
        webpackCompilerService = sinon.createStubInstance(WebpackCompiler);

        sandbox.stub(webpackCompiler, 'default').returns(webpackCompilerService);

        const config = new Config();
        config.set({ baseDir: "/" });

        webpackTranspiler = new WebpackTranspiler({ config, keepSourceMaps: false});

        fakeFileArray = [
            createTextFile("test"),
            createTextFile("works")
        ];
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("transpile", () => {
        it("should call the \"replace\" function on the \"webpackCompiler\"", async () => {
            await webpackTranspiler.transpile(fakeFileArray);
    
            assert(webpackCompilerService.replace.calledWith(fakeFileArray));
        });
    
        it("should call the \"emit\" function on the \"webpackCompiler\"", async () => {
            await webpackTranspiler.transpile([]);
    
            assert(webpackCompilerService.emit.calledOnce);
        });
    
        it("should send a successResponse when finished", async () => {
            const fakeEmitFiles: Array<TextFile> = [createTextFile("bundle.js")];

            webpackCompilerService.emit.resolves(fakeEmitFiles);
    
            const result: TranspileResult = await webpackTranspiler.transpile(fakeFileArray);
    
            expect(result.outputFiles).to.deep.equal(fakeEmitFiles);
            expect(result.error).to.be.null;
        });
    
        it("should send a errorResponse when the webpackCompiler throws an error", async () => {
            const fakeError: string = "fakeError";
    
            webpackCompilerService.emit.throwsException(Error(fakeError));
    
            const result: TranspileResult = await webpackTranspiler.transpile(fakeFileArray);
    
            expect(result.outputFiles).to.be.an("array").that.is.empty;
            expect(result.error).to.equal(`Error: ${fakeError}`);
        });
    });

    describe("getMappedLocation", () => {
        it("should throw an error informing the user the function is not implemented", () => {
            const position: Position = {
                line: 0,
                column: 0
            };
    
            const fileLocation: { fileName: string, start: Position, end: Position } = {
                fileName: "test",
                start: position,
                end: position
            }
    
            expect(webpackTranspiler.getMappedLocation.bind(this, fileLocation)).to.throw(Error, "Method not implemented.");
        });
    })
});

interface WebpackCompilerStubs {
    replace: sinon.SinonStub;
    emit: sinon.SinonStub;
}