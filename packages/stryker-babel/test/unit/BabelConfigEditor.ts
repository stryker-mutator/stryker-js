import BabelConfigEditor from '../../src/BabelConfigEditor';
import { ConfigEditor, Config } from 'stryker-api/config';
import { expect } from 'chai';

describe('BabelConfigEditor', () => {
    let babelConfigEditor: ConfigEditor;

    beforeEach(() => {
        babelConfigEditor = new BabelConfigEditor;
    });

    it('Should not alter the config object', () => {
        const customObj = { my: 'super', awesome: 'object' };
        const initialConfig = new Config();
        const config = new Config();
        initialConfig.set(customObj);
        config.set(customObj);

        babelConfigEditor.edit(config);


        expect(config).to.deep.equal(initialConfig);
    });
});