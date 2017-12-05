import * as path from "path";
import { Configuration } from 'webpack';

class DefaultPreset {
    public static getConfig(projectRoot: string): Configuration {
        try {
            return this.getConfigFromProjectRoot(projectRoot);
        } catch {
            return this.createSimpleWebpackConfig(projectRoot);
        }
    }

    private static getConfigFromProjectRoot(projectRoot: string) {
        return require(path.join(projectRoot, 'webpack.conf.js'));
    }

    private static createSimpleWebpackConfig(projectRoot: string) {
        const webpackConfig: any = {
            entry: [path.join(projectRoot, "src", "main.js")],

            output: {
                path: path.join(projectRoot, "dist"),
                filename: "bundle.js"
            }
        };

        return webpackConfig;
    }
}

export default DefaultPreset;