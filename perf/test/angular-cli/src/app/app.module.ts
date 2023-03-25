import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CatalogusComponent } from './catalogus/catalogus.component';
import { CatalogusArtikelComponent } from './catalogus/catalogus-artikel/catalogus-artikel.component';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { ShoppingCartPageComponent } from './shopping-cart/shopping-cart-page/shopping-cart-page.component';
import { AppRoutingModule } from './app-routing.module';
import { BestellingPlaatsenComponent } from './bestelling-plaatsen/bestelling-plaatsen.component';
import { KlantgegevensFormulierComponent } from './bestelling-plaatsen/klantgegevens-formulier/klantgegevens-formulier.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FactuurComponent } from './factuur/factuur.component';

@NgModule({
  declarations: [
    AppComponent, CatalogusComponent, CatalogusArtikelComponent, FooterComponent,
    NavbarComponent, ShoppingCartComponent, ShoppingCartPageComponent, BestellingPlaatsenComponent,
    KlantgegevensFormulierComponent, FactuurComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
