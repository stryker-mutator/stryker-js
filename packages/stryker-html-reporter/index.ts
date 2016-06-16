import {ReporterFactory} from 'stryker-api/report';
import HtmlReporter from './src/HtmlReporter';

ReporterFactory.instance().register('html', HtmlReporter);