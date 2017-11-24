import * as fs from 'fs';
import * as path from 'path';
import { ConfigEditor, Config } from 'stryker-api/config';
import { babelrcFileConfigKey } from './helpers/keys';

class BabelConfigEditor implements ConfigEditor {
    public edit(config: Config) {
        config.babelConfig = config.babelConfig || this.getConfig(config);
    }

    public getConfig(config: Config) {
        const baseDir = path.resolve(__dirname);

        let BabelRc;
        if (typeof config[babelrcFileConfigKey] === 'string') {
            const babelrcPath = path.join(baseDir, config[babelrcFileConfigKey]);
            console.log(babelrcPath);
            BabelRc = this.GetBabelRcFileContents(babelrcPath);
        }
        if (BabelRc == null) {
            console.warn('Babel config not found');
        }
        return BabelRc;
    }

    
    private GetBabelRcFileContents(path: string) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    }
}

export default BabelConfigEditor;