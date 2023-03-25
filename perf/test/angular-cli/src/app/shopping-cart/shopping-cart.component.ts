import {Component} from '@angular/core';
import {WinkelwagenService} from '../services/winkelwagen.service';
import {Winkelwagen} from '../models/winkelwagen';

@Component({
  selector: 'ksw-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent {

  public animationName = 'none';
  public itemCount = 0;

  constructor(private winkelwagenService: WinkelwagenService) {
    this.winkelwagenService.listen().subscribe(winkelwagen => {
      this.animate(winkelwagen);
    });
    this.itemCount = this.winkelwagenService.getWinkelwagen().getArtikelCount();
  }

  public async animate(winkelwagen: Winkelwagen) {
    this.itemCount = winkelwagen.getArtikelCount();
    this.changeAnimationName('animateCart');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.changeAnimationName('none');
  }

  public changeAnimationName(name: string): void {
    this.animationName = name;
  }

}
