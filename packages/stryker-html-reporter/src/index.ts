import HtmlReporter from './HtmlReporter';
import { plugins } from 'stryker-api/di';

export const strykerPlugins = plugins(HtmlReporter);
