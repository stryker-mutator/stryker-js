import * as path from "path";
import { Configuration, Rule, Plugin } from "webpack";
import { typescriptLoader, htmlLoader, imageLoader, cssStyleLoader, cssRawLoader } from "./angular/loaders";
import { contextReplacementPlugin } from './angular/plugins';

class AngularPreset {
    public static getConfig(root: string): Configuration {
        const webpackConfig: any = {
            entry: this.getEntryFiles(root),
          
            resolve: {
                extensions: ['.ts', '.js']
            },
          
            output: {
                path: path.join("/", "out"),
                filename: '[name].bundle.js',
                chunkFilename: '[id].chunk.js'
            },
          
            module: {
                rules: this.addRules(root)
            },
          
            plugins: this.addplugins(root)
        };

        return webpackConfig as Configuration;
    }

    private static getEntryFiles(root: string): EntryFiles {
        return {
            polyfills: path.join(root, "src", "polyfills.ts"),
            vendor: path.join(root, "stryker", "config", "vendor.ts"),
            app: path.join(root, "src", "polyfills"),
            test: path.join(root, "stryker", "config", "karma-test-shim.js")
        }
    }

    private static addRules(root: string): Array<Rule> {
        const loaders: Array<Rule> = [];

        loaders.push(typescriptLoader(root) as Rule);
        loaders.push(htmlLoader(root));
        loaders.push(imageLoader(root));
        loaders.push(cssStyleLoader(root));
        loaders.push(cssRawLoader(root));
        
        return loaders;
    }
    
    private static addplugins(root: string): Array<Plugin> {
        const plugins: Array<Plugin> = [];
        
        plugins.push(contextReplacementPlugin(root));

        return plugins;
    }
}

interface EntryFiles extends Object {
    polyfills: string;
    vendor: string;
    app: string;
    test: string;
}

export default AngularPreset;