import { by, ElementFinder } from 'protractor';
import ProgressBar from './ProgressBar';

export default class ResultTableRow {

  constructor(private readonly host: ElementFinder) {
  }
  public killed = () => this.host.element(by.css('td:nth-child(4)')).getText();
  public mutationScore = () => this.host.element(by.css('th:nth-child(3)')).getText();
  public name = () => this.nameTableElement().getText();
  public navigate = () => this.nameTableElement().element(by.css('a')).click();
  public noCoverage = () => this.host.element(by.css('td:nth-child(7)')).getText();
  public progressBar = () => new ProgressBar(this.host.element(by.css('td:nth-child(2)>div.progress')));
  public runtimeErrors = () => this.host.element(by.css('td:nth-child(8)')).getText();
  public survived = () => this.host.element(by.css('td:nth-child(5)')).getText();
  public timeout = () => this.host.element(by.css('td:nth-child(6)')).getText();
  public totalDetected = () => this.host.element(by.css('th:nth-child(10)')).getText();
  public totalMutants = () => this.host.element(by.css('th:nth-child(12)')).getText();
  public totalUndetected = () => this.host.element(by.css('th:nth-child(11)')).getText();
  public transpileErrors = () => this.host.element(by.css('td:nth-child(9)')).getText();

  private readonly nameTableElement = () => this.host.element(by.css('td:nth-child(1)'));
}
