import {Component, Input} from '@angular/core';
import {Artikel} from '../../models/artikel';
import {WinkelwagenService} from '../../services/winkelwagen.service';

@Component({
  selector: 'ksw-catalogus-artikel',
  templateUrl: './catalogus-artikel.component.html',
  styleUrls: ['./catalogus-artikel.component.scss'],
  host: {'class': 'artikel'},
})
export class CatalogusArtikelComponent {
  @Input() public artikel: Artikel;

  constructor(private winkelwagenService: WinkelwagenService) {
  }

  public addToWinkelwagen(artikel: Artikel) {
    this.winkelwagenService.addArtikelToWinkelwagen(artikel);
  }

}
