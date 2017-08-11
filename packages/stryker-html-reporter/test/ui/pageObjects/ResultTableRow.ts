import ProgressBar from './ProgressBar';
import { ElementFinder, by } from 'protractor';

export default class ResultTableRow {

  constructor(private host: ElementFinder) {
  }

  name = () => this.host.element(by.css('td:nth-child(1)')).getText();
  progressBar = () => new ProgressBar(this.host.element(by.css('td:nth-child(2)>div.progress')));
  mutationScore = () => this.host.element(by.css('th:nth-child(3)')).getText();
  killed = () => this.host.element(by.css('td:nth-child(4)')).getText();
  survived = () => this.host.element(by.css('td:nth-child(5)')).getText();
  timeout = () => this.host.element(by.css('td:nth-child(6)')).getText();
  noCoverage = () => this.host.element(by.css('td:nth-child(7)')).getText();
  errors = () => this.host.element(by.css('td:nth-child(8)')).getText();
  totalDetected = () => this.host.element(by.css('th:nth-child(9)')).getText();
  totalUndetected = () => this.host.element(by.css('th:nth-child(10)')).getText();
  totalMutants = () => this.host.element(by.css('th:nth-child(11)')).getText();
}