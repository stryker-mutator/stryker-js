import BabelConfigEditor from '../../src/BabelConfigEditor';
import { ConfigEditor, Config } from 'stryker-api/config';
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';

describe('BabelConfigEditor', () => {
    let babelConfigEditor: ConfigEditor;
    let sandbox: sinon.SinonSandbox;

    let babelConfigResult = JSON.stringify({
        plugins: [],
        presets: []
    });

    beforeEach(() => {
        babelConfigEditor = new BabelConfigEditor;
        sandbox = sinon.sandbox.create();

        sandbox.stub(fs, 'readFileSync').callsFake(() => babelConfigResult);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should contain the .babelrc in the config object', () => {
        const config = new Config();
        config.set({ babelRcFile: '.babelrc' });
        babelConfigEditor.edit(config);
        expect(config.babelConfig).to.deep.equal(JSON.parse(babelConfigResult));
    });
});