import WebpackConfigEditor from "../../src/WebpackConfigEditor";
import {Config} from "stryker-api/config";
import {expect} from "chai";

describe("WebpackwebpackConfigEditor", () => {
    let webpackConfigEditor: WebpackConfigEditor;
    let config: Config;

    beforeEach(() => {
        webpackConfigEditor = new WebpackConfigEditor();

        config = new Config();
    });

    describe("edit", () => {
        it("should edit a existing webpack config and override the cache option", () => {
            config.webpackConfig = { entry: [], output: { path: "/out", filename: "bundle.js" } }
    
            webpackConfigEditor.edit(config);
    
            expect(config.webpackConfig.cache).to.equal(true);
        });

        it("should create a default config when none is present", () => {
            webpackConfigEditor.edit(config);

            expect(config.webpackConfig).to.deep.equal({ entry: [], output: { path: "/out", filename: "bundle.js" }, cache: true });
        });
    });
});