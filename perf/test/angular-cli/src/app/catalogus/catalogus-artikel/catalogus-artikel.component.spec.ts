import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {CatalogusArtikelComponent} from './catalogus-artikel.component';
import {Artikel} from '../../models/artikel';
import {WinkelwagenService} from '../../services/winkelwagen.service';

describe('CatalogusArtikelComponent', () => {
  let component: CatalogusArtikelComponent;
  let fixture: ComponentFixture<CatalogusArtikelComponent>;
  let service: WinkelwagenService;
  /**
   * Gets a element in the native element
   * @param querySelector The query selector of the element
   */
  const getElement = (querySelector: string): HTMLElement => {
    return fixture.debugElement.nativeElement.querySelector(querySelector);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CatalogusArtikelComponent],
      providers: [WinkelwagenService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogusArtikelComponent);
    component = fixture.componentInstance;
    component.artikel = new Artikel(1, 'fiets bel', '', 15.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'AB', ['fietsen'], 10);
    fixture.detectChanges();
    service = TestBed.get(WinkelwagenService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('addToWinkelwagen()', () => {
    it('winkelwagenService.addArtikelToWinkelwagen should be called', () => {
      spyOn(service, 'addArtikelToWinkelwagen');
      component.addToWinkelwagen(component.artikel);
      expect(service.addArtikelToWinkelwagen).toHaveBeenCalledWith(component.artikel);
    });
  });
  describe('css testing', () => {
    it('.artikel-card-body should have display: flex', async () => {
      const element = getElement('.artikel-card-body');
      const computedElement = getComputedStyle(element);
      expect(computedElement.display).toBe('flex');
    });
  });
});
