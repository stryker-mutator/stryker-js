import {assert, expect} from "chai";
import * as sinon from "sinon";
import {createFakeFileSystem, createFakeWebpackConfig, createTextFile, createWebpackMock} from "../helpers/producers";
import {WebpackCompilerMock} from "../helpers/mockInterfaces";
import FsWrapper, * as fsWrapper from "../../src/helpers/FsWrapper";
import WebpackCompiler from "../../src/compiler/WebpackCompiler";
import {TextFile, FileKind} from "stryker-api/core";
import * as path from "path";
import * as webpack from "../../src/compiler/Webpack";
import {Configuration} from "webpack";

describe("WebpackCompiler", () => {
    let webpackCompiler: WebpackCompiler;
    let sandbox: sinon.SinonSandbox;
    let fsWrapperStubs: FsWrapperStubs;
    let webpackCompilerMock: WebpackCompilerMock;

    let fakeTextFileArray: Array<TextFile> = createFakeTextFileArray();
    let fakeWebpackConfig: Configuration = createFakeWebpackConfig();

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        fsWrapperStubs = sinon.createStubInstance(FsWrapper);
        webpackCompilerMock = createWebpackMock();

        sandbox.stub(webpack, "default").returns(webpackCompilerMock);
        sandbox.stub(fsWrapper, "default").returns(fsWrapperStubs);

        webpackCompiler = new WebpackCompiler(fakeWebpackConfig, createFakeFileSystem());
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("replace", () => {
        it("should call the mkdirp function on the fsWrapper with the basedir of the given file", async () => {
            await webpackCompiler.replace(fakeTextFileArray);

            fakeTextFileArray.forEach((textFile, index) => {
                assert(fsWrapperStubs.mkdirp.getCall(index).calledWith(path.dirname(textFile.name)));
            });
        });

        it("should call the writeFile function on the fsWrapper with the given file", async () => {
            await webpackCompiler.replace(fakeTextFileArray);
            
            fakeTextFileArray.forEach((textFile, index) => {
                assert(fsWrapperStubs.writeFile.getCall(index).calledWith(textFile.name));
            });
        });      
    });

    describe("emit", () => {
        let webpackRunStub: sinon.SinonStub;

        beforeEach(() => {
            webpackRunStub = sandbox.stub(webpackCompilerMock, "run").callsArgWith(0, null, { hasErrors: () => false });
        });        

        it("should call the run function on the webpack compiler", async () => {
            await webpackCompiler.emit();

            assert(webpackRunStub.calledOnce);
        });

        it("should call the readFile function on the fsWrapper with the bundle path", async () => {
            await webpackCompiler.emit();

            assert(fsWrapperStubs.readFile.calledWith("/out/bundle.js"));
        });

        it("should return a new TextFile array with the bundle in it", async () => {
            const content: string = "Hello World!";
            fsWrapperStubs.readFile.resolves(content);

            const files: Array<TextFile> = await webpackCompiler.emit();

            expect(files).to.deep.equal([{
                name: "bundle.js",
                content: content,
                mutated: true,
                included: true,
                transpiled: true,
                kind: FileKind.Text
            }]);
        });

        it("should return an error when the webpack compiler fails to compile", async () => {
            const fakeError: string = "fakeError";
            webpackRunStub.callsArgWith(0, new Error(fakeError));

            try {
                await webpackCompiler.emit();

                assert(false, "Function should throw an error!");
            } catch(err) {
                expect(err.name).to.equal("Error");
                expect(err.message).to.equal(fakeError);
            }
        });

        it("should return a string representation of the error when the compiler has errors", async () => {
            const fakeError: string = "fakeError";
            webpackRunStub.callsArgWith(0, null, {
                hasErrors: () => true,
                toString: () => fakeError
            });

            try {
                await webpackCompiler.emit();

                assert(false, "Function should throw an error!");
            } catch(err) {
                expect(err.name).to.equal("Error");
                expect(err.message).to.equal(fakeError);
            }
        });
    });

    function createFakeTextFileArray(): Array<TextFile> {
        return [
            createTextFile("path/to/awesome/directory/file1"),
            createTextFile("path/to/awesome/directory/file2"),
            createTextFile("path/to/awesome/directory/file3"),
            createTextFile("path/to/awesome/directory/file4")
        ];
    }
});

interface FsWrapperStubs {
    readFile: sinon.SinonStub;
    writeFile: sinon.SinonStub;
    mkdirp: sinon.SinonStub;
}