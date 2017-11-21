import * as fs from "mz/fs";
import {TextFile, FileKind} from "stryker-api/core";
import {Config} from "stryker-api/config";
import {TranspileResult, TranspilerOptions} from "stryker-api/transpile";
import * as path from "path";
import {expect} from "chai";
import WebpackTranspiler from "../../src/WebpackTranspiler";
import Transpiler from "stryker-api/src/transpile/Transpiler";
import execute from "../helpers/executeJs";

describe("WebpackTranspiler", () => {
    const sampleProjectLocation: string = path.resolve(__dirname, "../../testResources/sampleProject");

    let files: Array<TextFile> = [];
    let webPackTranspiler: Transpiler;

    beforeEach(async () => {
        webPackTranspiler = new WebpackTranspiler(createStrykerConfig());

        files = await fetchTextFiles(sampleProjectLocation);
    });

    it("should have an array with files", () => {
        expect(files).to.be.an("array").that.is.not.empty;
    });

    it("should return a bundle file when the transpiler is called", async () => {
        try {
            const result: TranspileResult = await webPackTranspiler.transpile(files);
            const outFile: TextFile = result.outputFiles[0] as TextFile;

            outFile.content = outFile.content.replace(/'/g, '"')

            const {stdout} = await execute(outFile.content);    
            expect(stdout).to.equal('[ 2, 1, 1, 4, 4, 1, 6, 9, 1, 8, 16, 1 ]\n');
        } catch(err) {
            throw new Error(err);
        }
    });

    async function fetchTextFiles(dir: string, textFileArray?: Array<TextFile>): Promise<Array<TextFile>> {
        const results = await fs.readdir(dir);
        textFileArray = textFileArray || [];

        for(let key in results) {
            if(results.hasOwnProperty(key)) {
                const result = path.join(dir, results[key]);
                const stats: fs.Stats = await fs.stat(result);

                if(stats.isDirectory()) {
                    await fetchTextFiles(result, textFileArray);
                } else {
                    textFileArray.push(await createTextFile(result));
                }
            }
        }

        return textFileArray;
    }

    async function createTextFile(fileName: string): Promise<TextFile> {
        return {
            name: fileName,
            content: await fs.readFile(fileName, "utf8"),
            included: true,
            mutated: true,
            transpiled: true,
            kind: FileKind.Text
        }
    }

    function createStrykerConfig(): TranspilerOptions {
        const config: Config = new Config;

        config.set(Object.assign(config, {
            webpackConfig : {
                entry: [path.resolve(path.resolve(sampleProjectLocation, "index.js"))],
                output: {
                    path: "/out",
                    filename: "bundle.js",
                }
            }
        }));

        return {
            config: config,
            keepSourceMaps: false
        }
    }
});

