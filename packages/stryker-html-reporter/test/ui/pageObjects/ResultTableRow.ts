import ProgressBar from './ProgressBar';

export default class ResultTableRow {

  constructor(private host: protractor.ElementFinder) {
  }

  name = () => this.host.element(by.css(':nth-child(1)')).getText();
  progressBar = () => new ProgressBar(this.host.element(by.css(':nth-child(2)>div')));
  mutationScore = () => this.host.element(by.css(':nth-child(3)')).getText();
  killed = () => this.host.element(by.css(':nth-child(4)')).getText();
  survived = () => this.host.element(by.css(':nth-child(5)')).getText();
  timeout = () => this.host.element(by.css(':nth-child(6)')).getText();
  noCoverage = () => this.host.element(by.css(':nth-child(7)')).getText();
  errors = () => this.host.element(by.css(':nth-child(8)')).getText();
  totalDetected = () => this.host.element(by.css(':nth-child(9)')).getText();
  totalUndetected = () => this.host.element(by.css(':nth-child(10)')).getText();
  totalMutants = () => this.host.element(by.css(':nth-child(11)')).getText();
}