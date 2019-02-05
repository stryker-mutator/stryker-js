import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {CatalogusComponent} from './catalogus/catalogus.component';
import {FooterComponent} from './footer/footer.component';
import {CatalogusArtikelComponent} from './catalogus/catalogus-artikel/catalogus-artikel.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NavbarComponent} from './navbar/navbar.component';
import {ShoppingCartComponent} from './shopping-cart/shopping-cart.component';
import {AppRoutingModule} from './app-routing.module';
import {ShoppingCartPageComponent} from './shopping-cart/shopping-cart-page/shopping-cart-page.component';
import {BestellingPlaatsenComponent} from './bestelling-plaatsen/bestelling-plaatsen.component';
import {KlantgegevensFormulierComponent} from './bestelling-plaatsen/klantgegevens-formulier/klantgegevens-formulier.component';
import {ReactiveFormsModule} from '@angular/forms';
import {FactuurComponent} from './factuur/factuur.component';


describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  /**
   * Gets a element in the native element
   * @param querySelector The query selector of the element
   */
  const getElement = (querySelector: string): HTMLElement => {
    return fixture.debugElement.nativeElement.querySelector(querySelector);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        CatalogusComponent,
        CatalogusArtikelComponent,
        FooterComponent,
        NavbarComponent,
        ShoppingCartComponent,
        ShoppingCartPageComponent,
        BestellingPlaatsenComponent,
        KlantgegevensFormulierComponent,
        FactuurComponent
      ],
      imports: [
        HttpClientTestingModule,
        AppRoutingModule,
        ReactiveFormsModule
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  }));
  it('should create the app', async(() => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('title should be `Kantischop`', (() => {
    expect(component.title).toBe('Kantishop');
  }));
  describe('css testing', () => {
    it('.container should have display: flex', () => {
      const element = getElement('.container');
      const computedElement = getComputedStyle(element);
      expect(computedElement.display).toBe('flex');
    });
  });
});
