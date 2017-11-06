import {ConfigEditor, Config} from "stryker-api/config";

class WebpackConfigEditor implements ConfigEditor {
    public edit(strykerConfig: Config) {
        strykerConfig.webpackConfig = strykerConfig.webpackConfig || {
            entry: [],
            output: {
                path: "/out",
                filename: "bundle.js",
            }
        }

        // Force cache to true
        strykerConfig.webpackConfig.cache = true;
    }
}

export default WebpackConfigEditor;