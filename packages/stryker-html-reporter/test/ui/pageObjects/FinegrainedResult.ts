import ProgressBar from './ProgressBar';

export default class FinegrainedResult {

  constructor(private host: protractor.ElementFinder) {
  }

  name = this.host.element(by.css('td:nth-child(1)')).getText();
  progressBar = new ProgressBar(this.host.element(by.css('td:nth-child(2)>div')));
  scoreBasedOnAllCode = this.host.element(by.css('td:nth-child(3)')).getText();
  percentageBasedOnCodeCoverage = this.host.element(by.css('td:nth-child(4)')).getText();
  scoreBasedOnCodeCoverage = this.host.element(by.css('td:nth-child(5)')).getText();
}