
export default class ProgressBar {
  constructor(private host: protractor.ElementFinder) {
  }

  private progressBar = this.host.element(by.css('.progress-bar'));

  percentageText = this.progressBar.getText();
  barSize = this.progressBar.getSize();
  totalSize = this.host.getSize();
  relativeBarWidth = this.totalSize.then(totalSize => this.barSize.then(barSize => Math.floor((barSize.width / totalSize.width) * 100)));
}