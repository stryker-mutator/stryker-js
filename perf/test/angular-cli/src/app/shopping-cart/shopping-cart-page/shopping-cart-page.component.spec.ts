import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ShoppingCartPageComponent} from './shopping-cart-page.component';
import {WinkelwagenService} from '../../services/winkelwagen.service';
import {WinkelwagenRegel} from '../../models/winkelwagenRegel';
import {Artikel} from '../../models/artikel';

describe('ShoppingCartPageComponent', () => {
  let component: ShoppingCartPageComponent;
  let fixture: ComponentFixture<ShoppingCartPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShoppingCartPageComponent],
      providers: [WinkelwagenService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a winkelwagen', () => {
    expect(component.winkelwagen).not.toBeNull();
  });

  describe('getTotaalPrijs()', () => {
    beforeEach(() => {
      // Arrange
      const testArtikel1 = new Artikel(1, 'Test artikel', 'test', 10, 'images/foo.png', new Date(), new Date(), 'PRD1', [], 1);
      const testArtikel2 = new Artikel(2, 'Test artikel 2', 'test 2', 15, 'images/foo.png', new Date(), new Date(), 'PRD2', [], 1);
      const testData = [
        new WinkelwagenRegel(testArtikel1),
        new WinkelwagenRegel(testArtikel2)
      ];
      testData[0].aantal = 2;
      spyOn(component.winkelwagen, 'getWinkelwagenRegels').and.returnValue(testData);
    });

    it('should be able to calculate the total cart price', () => {
      // Act
      const totaalprijs = component.getTotaalPrijs();

      // Assert
      expect(component.winkelwagen.getWinkelwagenRegels).toHaveBeenCalled();
      expect(totaalprijs).toBe(35);
    });

    it('should return a number', () => {
      // Act
      const totaalprijs = component.getTotaalPrijs();
      // Assert
      expect(totaalprijs).not.toBeNaN();
    });
  });
});
