/* eslint-disable import/no-default-export */
// @ts-check
import settings from '../../stryker.parent.conf.json' with { type: 'json' };

settings.dashboard.module = import.meta.url.split('/').at(-2);
settings.mochaOptions.spec = ['dist/test/**/*.js'];
settings.mutate = ['src/**/*.ts'];
/**
 * @type {import('../api/dist/src/core/index.js').PartialStrykerOptions}
 */
export default settings;
