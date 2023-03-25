import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CatalogusComponent} from './catalogus/catalogus.component';
import {ShoppingCartPageComponent} from './shopping-cart/shopping-cart-page/shopping-cart-page.component';
import {BestellingPlaatsenComponent} from './bestelling-plaatsen/bestelling-plaatsen.component';
import {FactuurComponent} from './factuur/factuur.component';
import {DirectAccessGuard} from './directAccessGuard';

const routes: Routes = [
  { path: '', component: CatalogusComponent },
  { path: 'catalogus', component: CatalogusComponent },
  { path: 'winkelmand', component: ShoppingCartPageComponent},
  { path: 'bestelling-plaatsen', component: BestellingPlaatsenComponent, canActivate: [DirectAccessGuard]},
  { path: 'bestelling-factuur', component: FactuurComponent, canActivate: [DirectAccessGuard] },
  { path: '**', redirectTo: 'CatalogusComponent' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }

