import { by, ElementFinder } from 'protractor';

export default class ProgressBar {

  private readonly progressBar = this.host.element(by.css('.progress-bar'));
  constructor(private readonly host: ElementFinder) {
  }
  public barSize = () => this.progressBar.getSize();

  public percentageText = () => this.progressBar.getText();
  public relativeBarWidth = () => this.totalSize().then(totalSize => this.barSize()
    .then(barSize => Math.floor((barSize.width / totalSize.width) * 100)))
  public totalSize = () => this.host.getSize();
}
