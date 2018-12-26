import { ElementFinder, promise } from 'protractor';
import ResultTableRow from './ResultTableRow';

export default class ResultTable {

  constructor(private readonly host: ElementFinder) {
  }

  public head() {
    return this.host.$$('thead th');
  }

  public async row(name: string) {
    const rows = await this.rows();
    const names = (await promise.all(rows.map(row => row.name()))).map(name => name.trim());
    const index = names.indexOf(name);
    if (index === -1) {
      throw new Error(`Name "${name}" not found in table. Only found names: ${names.map(n => `"${n}"`).join(', ')}`);
    } else {
      return rows[index];
    }
  }

  public async rows() {
    const rows: ElementFinder[] = await this.host.$$('tbody tr');

    return rows.map(row => new ResultTableRow(row));
  }

}
