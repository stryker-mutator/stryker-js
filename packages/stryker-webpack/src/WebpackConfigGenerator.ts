import { Configuration } from 'webpack';
import { DefaultPreset, AngularPreset } from "./configGenerator/presets";
import * as path from "path";

class WebpackConfigGenerator {
    public generate(project: string, projectDir: string): Configuration {
        // Set the basedir to path.resolve(__dirname) when no basedir is provided
        projectDir = projectDir || path.resolve(__dirname);

        // Use a preset configuration file based on the project when none is provided.
        const webpackConfig = this.getConfig(project, projectDir);

        // Force the webpack cache to true
        webpackConfig.cache = true;

        return webpackConfig;
    }

    private getConfig(project: string, projectDir: string): Configuration {
        let webpackConfig: Configuration;

        switch(project.toLowerCase()) {
            case 'angular':
                webpackConfig = AngularPreset.getConfig(projectDir);
            break;
            default:
                webpackConfig = DefaultPreset.getConfig(projectDir);
            break
        }

        return webpackConfig;
    }
}

export default WebpackConfigGenerator;