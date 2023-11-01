/* eslint-disable import/no-default-export */
// @ts-check
import fs from 'fs';
import { URL } from 'url';

const settings = JSON.parse(fs.readFileSync(new URL('../../stryker.parent.conf.json', import.meta.url), 'utf-8'));
settings.dashboard.module = import.meta.url.split('/').at(-2);
settings.mochaOptions.spec = ['dist/test/**/*.js'];
/**
 * @type {import('../api/dist/src/core/index.js').PartialStrykerOptions}
 */
export default settings;
