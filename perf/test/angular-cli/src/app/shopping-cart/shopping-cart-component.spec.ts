import {ShoppingCartComponent} from './shopping-cart.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WinkelwagenService} from '../services/winkelwagen.service';
import {Winkelwagen} from '../models/winkelwagen';
import {Artikel} from '../models/artikel';
import {WinkelwagenRegel} from '../models/winkelwagenRegel';
import {Observable, Subject} from 'rxjs';

describe('ShoppingCartComponent', () => {
  let component: ShoppingCartComponent;
  let fixture: ComponentFixture<ShoppingCartComponent>;
  let winkelwagenServiceStub;
  /**
   * Gets a element in the native element
   * @param querySelector The query selector of the element
   */
  const getElement = (querySelector: string): HTMLElement => {
    return fixture.debugElement.nativeElement.querySelector(querySelector);
  };
  beforeEach(() => {
    let store = {};
    const mockSessionStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };

    spyOn(sessionStorage, 'getItem').and.callFake(mockSessionStorage.getItem);
    spyOn(sessionStorage, 'setItem').and.callFake(mockSessionStorage.setItem);
    spyOn(sessionStorage, 'removeItem').and.callFake(mockSessionStorage.removeItem);
    spyOn(sessionStorage, 'clear').and.callFake(mockSessionStorage.clear);

    winkelwagenServiceStub = {
      winkelwagenDataKey: 'winkelwagenData',
      listeners: new Subject<any>(),
      winkelwagen: new Winkelwagen(),
      listen: (): Observable<Winkelwagen> => {
        return winkelwagenServiceStub.listeners.asObservable();
      },
      addArtikelToWinkelwagen: (artikel: Artikel): void => {
        winkelwagenServiceStub.winkelwagen.addArtikel(artikel);
        winkelwagenServiceStub.listeners.next(winkelwagenServiceStub.winkelwagen);
      },
      getWinkelwagen: (): Winkelwagen => {
        return winkelwagenServiceStub.winkelwagen;
      },
      clearWinkelwagen: (): void => {
        winkelwagenServiceStub.winkelwagen.clear();
        winkelwagenServiceStub.listeners.next(winkelwagenServiceStub.winkelwagen);
      }
    };
    TestBed.configureTestingModule({
      declarations: [ShoppingCartComponent],
      providers: [{provide: WinkelwagenService, useValue: winkelwagenServiceStub}]
    }).compileComponents();
  });

  beforeEach(() => {
    spyOn(window, 'confirm').and.callFake(function () {
      return true;
    });
    fixture = TestBed.createComponent(ShoppingCartComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have 0 items in it when visit shop for first time', () => {
    expect(component.itemCount).toBe(0);
  });

  it('should have animationName none on init', () => {
    expect(component.animationName).toBe('none');
  });


  describe('animate()', () => {
    let winkelwagen: Winkelwagen;

    beforeEach(() => {
      winkelwagen = new Winkelwagen();
      const testArtikel1 = new Artikel(1, 'Test artikel', 'test', 10, 'images/foo.png', new Date(), new Date(), 'PRD1', [], 2);
      const testArtikel2 = new Artikel(2, 'Test artikel 2', 'test 2', 15, 'images/foo.png', new Date(), new Date(), 'PRD2', [], 1);
      const testData = [
        new WinkelwagenRegel(testArtikel1),
        new WinkelwagenRegel(testArtikel2)
      ];
      testData[0].aantal = 2;
      winkelwagen.setWinkelwagenRegels(testData);
    });

    it('should change the itemcount', () => {
      component.animate(winkelwagen).then(() =>
        expect(component.itemCount).toBe(3)
      );
    });

    it('should call winkelwagen.getArtikelCount() once', () => {
      spyOn(winkelwagen, 'getArtikelCount');
      spyOn(component, 'changeAnimationName');
      component.animate(winkelwagen).then(() => {
        expect(winkelwagen.getArtikelCount).toHaveBeenCalledTimes(1);
        expect(component.itemCount).toBe(1);
      });
    });

    it('should call change animation twice and animationName should be `none`', () => {
      spyOn(winkelwagen, 'getArtikelCount');
      spyOn(component, 'changeAnimationName');
      component.animate(winkelwagen).then(() => {
        expect(component.changeAnimationName).toHaveBeenCalledTimes(2);
        expect(component.changeAnimationName).toHaveBeenCalledWith('none');
        expect(component.changeAnimationName).toHaveBeenCalledWith('animateCart');
        expect(component.animationName).toBe('none');
      });
    });

    it('should notify listeners', () => {
      spyOn(winkelwagenServiceStub.listeners, 'next');
      component.animate(winkelwagen).then(() => {
        expect(winkelwagenServiceStub.listeners.next(winkelwagen)).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('css testing', () => {
    it('.artikel-card-body should have display: flex', async () => {
      const element = getElement('span.cart-count');
      const computedElement = getComputedStyle(element);
      expect(computedElement.marginLeft).toBe('10px');
    });
  });
});
