import FsWrapper from "../../src/helpers/FsWrapper";
import * as sinon from "sinon";
import { assert, expect } from "chai";
import * as fs from "fs";
import * as path from "path";

describe("FsWrapper", () => {
    let fsWrapper: FsWrapper;
    let fsStubs: FsStubs;
    let sandbox: sinon.SinonSandbox;

    const fakeErr: Error = new Error("err");
    const exampleFileContent = "Hello World!";

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        fsStubs = createFsStubs();
        fsWrapper = new FsWrapper(fs);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("readFile", () => {
        it("should return a promise which resolves with \"" + exampleFileContent + "\"", async () => {
            try {
                const content: string = await fsWrapper.readFile("/path/to/file");

                expect(content).to.equal(exampleFileContent);
            } catch (err) { }
        });

        it("should call readFile on the given fs with path and \"utf8\"", async () => {
            try {
                const path: string = "/path/to/file";

                await fsWrapper.readFile(path);

                assert(fsStubs.readFile.calledWith(path, "utf8"));
            } catch (err) { }
        });

        it("should reject with an error when the readFile function on the given fs returns an error", async () => {
            fsStubs.readFile.callsArgWith(2, fakeErr);

            try {
                await fsWrapper.readFile("asdf");

                assert(false, "Function should throw an error!");
            } catch (err) {
                expect(err).to.equal(fakeErr);
            }
        });
    });

    describe("writeFile", () => {
        it("should call writeFile on the given fs with path and content", async () => {
            const examplePath: string = "/path/to/file";

            try {
                await fsWrapper.writeFile(examplePath, exampleFileContent);

                assert(fsStubs.writeFile.calledWith(examplePath, exampleFileContent));
            } catch (err) { }
        });

        it("should reject with an error when writeFile on the given fs returns with an error", async () => {
            fsStubs.writeFile.callsArgWith(2, fakeErr);

            try {
                await fsWrapper.writeFile("asdf", "asdf");

                assert(false, "Function should throw an error!");
            } catch (err) {
                expect(err).to.equal(fakeErr);
            }
        });
    });

    describe("mkdirp", () => {
        const examplePath: string = "path/to/directory/and/file";
        let pathElementCounter: number;

        beforeEach(() => {
            pathElementCounter = 0;
            fsStubs.mkdir.callsFake((requestedPath: string, options: {}, callback: Function) => {
                const elements: Array<string> = requestedPath.split(path.sep);

                if (elements.length > pathElementCounter + 1) {
                    callback(new FileSystemError({ code: "ENOENT" }));
                } else if (elements.length === pathElementCounter) {
                    callback(new FileSystemError({ code: "EEXIST" }));
                } else {
                    pathElementCounter++;

                    callback();
                }
            });
        });

        it("should call the mkdir function on the given fs with the given path", async () => {
            await fsWrapper.mkdirp(examplePath);

            assert(fsStubs.mkdir.calledWith(examplePath));
        });

        it("should bubble down and back up again", async () => {
            const callCount: number = (examplePath.split(path.sep).length * 2) - 1;

            await fsWrapper.mkdirp(examplePath);

            assert(fsStubs.mkdir.callCount === callCount);
        });

        it("should reject with an error when a file exists in the given path", async () => {
            pathElementCounter = examplePath.split(path.sep).length;

            try {
                await fsWrapper.mkdirp(examplePath);

                assert(false, "Function should throw an error!");
            } catch (err) {
                expect(err.code).to.equal("EEXIST");
            }
        });

        it("should not reject with an error when the directory already exists in the given path", async () => {
            const examplePathArray: Array<string> = examplePath.split(path.sep);

            // Pop the last element, in this case "file" so isDirectory in the stat function will return true
            examplePathArray.pop();

            pathElementCounter = examplePathArray.length;

            try {
                await fsWrapper.mkdirp(examplePathArray.join(path.sep));

                assert(true);
            } catch (err) {
                assert(false, "Function should not throw an error!");
            }
        });

        it("should throw an error when an unknown error is thrown by mkdir", async () => {
            fsStubs.mkdir.throws(new FileSystemError({code: "UNKNOWN"}));

            try {
                await fsWrapper.mkdirp("path/to/file");

                assert(false, "Function should throw an error!");
            } catch(err) {
                assert(fsStubs.stat.notCalled);
                expect(err.code).to.equal("UNKNOWN");
            }
        });

        it("should throw an error when stat rejects with an error", async () => {
            fsStubs.mkdir.throws(new FileSystemError({code: "EEXIST"}));

            fsStubs.stat.callsArgWith(1, fakeErr, null);

            try {
                await fsWrapper.mkdirp("path/to/file");

                assert(false, "Function should throw an error!");
            } catch(err) {
                expect(err).to.equal(fakeErr);
            }
        });
    });

    function createFsStubs(): FsStubs {
        return {
            readFile: sandbox.stub(fs, "readFile").callsArgWith(2, null, exampleFileContent),
            writeFile: sandbox.stub(fs, "writeFile").callsArgWith(2, null),
            stat: sandbox.stub(fs, "stat").callsFake((subject: string, callback: Function) => callback(null, {
                isDirectory: () => path.basename(subject) !== "file"
            })),
            mkdir: sandbox.stub(fs, "mkdir")
        };
    }
});

class FileSystemError extends Error {
    public code: string;

    public constructor(err: { code: string }) {
        super("err");

        this.code = err.code;
    }
}

interface FsStubs {
    readFile: sinon.SinonStub;
    writeFile: sinon.SinonStub;
    stat: sinon.SinonStub;
    mkdir: sinon.SinonStub;
}