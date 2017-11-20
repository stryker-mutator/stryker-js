import * as path from "path";
import { Configuration, Rule, Plugin } from "webpack";
import { typescriptLoader, htmlLoader, imageLoader, cssStyleLoader, cssRawLoader } from "./angular/loaders";
import { contextReplacementPlugin } from './angular/plugins';

class AngularPreset {
    public static getConfig(): Configuration {
        const webpackConfig: any = {
            entry: this.getEntryFiles(),
          
            resolve: {
                extensions: ['.ts', '.js']
            },
          
            output: {
                path: path.join("/", "out"),
                filename: '[name].bundle.js',
                chunkFilename: '[id].chunk.js'
            },
          
            module: {
                rules: this.addRules()
            },
          
            plugins: this.addplugins()
        };

        return webpackConfig as Configuration;
    }

    private static getEntryFiles(): EntryFiles {
        return {
            polyfills: path.join("/", "src", "polyfills.ts"),
            vendor: path.join("/", "stryker", "config", "vendor.ts"),
            app: path.join("/", "src", "polyfills"),
            test: path.join("/", "stryker", "config", "karma-test-shim.js")
        }
    }

    private static addRules(): Array<Rule> {
        const loaders: Array<Rule> = [];

        loaders.push(typescriptLoader as Rule);
        loaders.push(htmlLoader);
        loaders.push(imageLoader);
        loaders.push(cssStyleLoader);
        loaders.push(cssRawLoader);
        
        return loaders;
    }
    
    private static addplugins(): Array<Plugin> {
        const plugins: Array<Plugin> = [];
        
        plugins.push(contextReplacementPlugin);

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