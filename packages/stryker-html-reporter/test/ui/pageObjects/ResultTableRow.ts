import ProgressBar from './ProgressBar';
import { ElementFinder, by } from 'protractor';

export default class ResultTableRow {

  constructor(private readonly host: ElementFinder) {
  }

  private readonly nameTableElement = () => this.host.element(by.css('td:nth-child(1)'));
  public navigate = () => this.nameTableElement().element(by.css('a')).click();
  public name = () => this.nameTableElement().getText();
  public progressBar = () => new ProgressBar(this.host.element(by.css('td:nth-child(2)>div.progress')));
  public mutationScore = () => this.host.element(by.css('th:nth-child(3)')).getText();
  public killed = () => this.host.element(by.css('td:nth-child(4)')).getText();
  public survived = () => this.host.element(by.css('td:nth-child(5)')).getText();
  public timeout = () => this.host.element(by.css('td:nth-child(6)')).getText();
  public noCoverage = () => this.host.element(by.css('td:nth-child(7)')).getText();
  public runtimeErrors = () => this.host.element(by.css('td:nth-child(8)')).getText();
  public transpileErrors = () => this.host.element(by.css('td:nth-child(9)')).getText();
  public totalDetected = () => this.host.element(by.css('th:nth-child(10)')).getText();
  public totalUndetected = () => this.host.element(by.css('th:nth-child(11)')).getText();
  public totalMutants = () => this.host.element(by.css('th:nth-child(12)')).getText();
}
