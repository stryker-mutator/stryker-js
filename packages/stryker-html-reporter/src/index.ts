import { ReporterFactory } from 'stryker-api/report';
import HtmlReporter from './HtmlReporter';

ReporterFactory.instance().register('html', HtmlReporter);
