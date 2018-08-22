import { ElementFinder, by } from 'protractor';

export default class ProgressBar {
  constructor(private readonly host: ElementFinder) {
  }

  private readonly progressBar = this.host.element(by.css('.progress-bar'));

  public percentageText = () => this.progressBar.getText();
  public barSize = () => this.progressBar.getSize();
  public totalSize = () => this.host.getSize();
  public relativeBarWidth = () => this.totalSize().then(totalSize => this.barSize()
    .then(barSize => Math.floor((barSize.width / totalSize.width) * 100)))
}
