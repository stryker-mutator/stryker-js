import {ConfigEditor, Config} from "stryker-api/config";
import { Configuration } from 'webpack';
import { DefaultPreset, AngularPreset } from "./configEditor/presets";

class WebpackConfigEditor implements ConfigEditor {
    public edit(strykerConfig: Config) {
        // Set project to default when none is provided.
        strykerConfig.project = strykerConfig.project || 'default';

        // Use a preset configuration file based on the project when none is provided.
        strykerConfig.webpackConfig = strykerConfig.webpackConfig || this.getConfig(strykerConfig.project);

        // Force the webpack cache to true
        strykerConfig.webpackConfig.cache = true;
    }

    private getConfig(project: string): Configuration {
        let webpackConfig: Configuration;

        switch(project.toLowerCase()) {
            case 'angular':
                webpackConfig = AngularPreset.getConfig();
            break;
            default:
                webpackConfig = DefaultPreset.getConfig();
            break
        }

        return webpackConfig;
    }
}

export default WebpackConfigEditor;