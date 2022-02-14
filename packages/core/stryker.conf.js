// @ts-check
import fs from 'fs';
const settings = JSON.parse(fs.readFileSync(new URL('../../stryker.parent.conf.json', import.meta.url), 'utf-8'));
settings.dashboard.module = import.meta.url.split('/').slice(-2)[0];
/**
  * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
  */
export default settings;

