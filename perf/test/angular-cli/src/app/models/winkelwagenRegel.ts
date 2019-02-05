import {Artikel} from './artikel';

export class WinkelwagenRegel {
  public artikel: Artikel;
  public aantal: number;

  constructor(artikel: Artikel) {
    this.artikel = artikel;
    this.aantal = 1;
  }
}
