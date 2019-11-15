import {WinkelwagenRegel} from './winkelwagenRegel';
import {Artikel} from './artikel';

export class Winkelwagen {

  private winkelwagenRegels: Array<WinkelwagenRegel> = [];
  private winkelwagenDataKey = 'winkelwagen';

  constructor() {
    if (sessionStorage.getItem(this.winkelwagenDataKey)) {
      this.winkelwagenRegels = JSON.parse(sessionStorage.getItem(this.winkelwagenDataKey));
    } else {
      this.setWinkelwagenRegels(this.winkelwagenRegels);
    }
  }

  public getWinkelwagenRegels(): Array<WinkelwagenRegel> {
    return this.winkelwagenRegels;
  }

  public setWinkelwagenRegels(regels: Array<WinkelwagenRegel>) {
    this.winkelwagenRegels = regels;
    sessionStorage.setItem(this.winkelwagenDataKey, JSON.stringify(this.winkelwagenRegels));
  }

  public addArtikel(artikel: Artikel) {
    let artikelAdded = false;

    for (let i = 0; i < this.winkelwagenRegels.length; i++) {
      if (this.winkelwagenRegels[i].artikel.artikelNummer === artikel.artikelNummer) {
        this.winkelwagenRegels[i].aantal++;
        artikelAdded = true;
        break;
      }
    }

    if (!artikelAdded) {
      this.winkelwagenRegels.push(new WinkelwagenRegel(artikel));
    }

    this.setWinkelwagenRegels(this.winkelwagenRegels);
  }

  public getArtikelCount(): number {
    let count = 0;
    this.winkelwagenRegels.forEach(regel => {
      count = count + regel.aantal;
    });
    return count;
  }

  public clear(): void {
    const confirmed = confirm('Weet u zeker dat u de winkelwagen wilt legen?');
    if (confirmed) {
      this.winkelwagenRegels = [];
      this.setWinkelwagenRegels(this.winkelwagenRegels);
    }
  }

  public clearNoConfirm(): void {
    this.winkelwagenRegels = [];
    this.setWinkelwagenRegels(this.winkelwagenRegels);
  }

  getTotaalPrijs(): number {
    const regels = this.winkelwagenRegels;
    const totaalPrijs = regels.reduce((total, artikel) => total + (artikel.aantal * artikel.artikel.prijs), 0);
    return totaalPrijs;
  }
}
