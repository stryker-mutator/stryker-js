import ProgressBar from './ProgressBar';
import { ElementFinder, by } from 'protractor';

export default class ResultTableRow {

  constructor(private host: ElementFinder) {
  }

  private nameTableElement = () => this.host.element(by.css('td:nth-child(1)'));
  navigate = () => this.nameTableElement().element(by.css('a')).click();
  name = () => this.nameTableElement().getText();
  progressBar = () => new ProgressBar(this.host.element(by.css('td:nth-child(2)>div.progress')));
  mutationScore = () => this.host.element(by.css('th:nth-child(3)')).getText();
  killed = () => this.host.element(by.css('td:nth-child(4)')).getText();
  survived = () => this.host.element(by.css('td:nth-child(5)')).getText();
  timeout = () => this.host.element(by.css('td:nth-child(6)')).getText();
  noCoverage = () => this.host.element(by.css('td:nth-child(7)')).getText();
  runtimeErrors = () => this.host.element(by.css('td:nth-child(8)')).getText();
  transpileErrors = () => this.host.element(by.css('td:nth-child(9)')).getText();
  totalDetected = () => this.host.element(by.css('th:nth-child(10)')).getText();
  totalUndetected = () => this.host.element(by.css('th:nth-child(11)')).getText();
  totalMutants = () => this.host.element(by.css('th:nth-child(12)')).getText();
}