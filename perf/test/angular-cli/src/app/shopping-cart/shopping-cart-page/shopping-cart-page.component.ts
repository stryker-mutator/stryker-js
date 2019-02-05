import {Component} from '@angular/core';
import {WinkelwagenService} from '../../services/winkelwagen.service';
import {Winkelwagen} from '../../models/winkelwagen';

@Component({
  selector: 'ksw-shopping-cart-page',
  templateUrl: './shopping-cart-page.component.html',
  styleUrls: ['./shopping-cart-page.component.scss']
})
export class ShoppingCartPageComponent {

  public winkelwagen: Winkelwagen;

  constructor(public service: WinkelwagenService) {
    this.winkelwagen = this.service.getWinkelwagen();
  }

  getTotaalPrijs(): number {
    const regels = this.winkelwagen.getWinkelwagenRegels();
    const totaalPrijs = regels.reduce((total, artikel) => total + (artikel.aantal * artikel.artikel.prijs), 0);
    return totaalPrijs;
  }
}
