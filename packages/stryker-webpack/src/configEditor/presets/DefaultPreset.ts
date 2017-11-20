import * as path from "path";
import { Configuration } from 'webpack';

class DefaultPreset {
    public static getConfig(): Configuration {
        const webpackConfig: any = {
            entry: [path.join("/", "src", "main.js")],

            output: {
                path: path.join("/", "out"),
                filename: "bundle.js"
            }
        };

        return webpackConfig;
    }
}

export default DefaultPreset;