import {async, TestBed} from '@angular/core/testing';
import {WinkelwagenService} from './winkelwagen.service';
import {Artikel} from '../models/artikel';

describe('WinkelwagenService', () => {
  let service: WinkelwagenService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({})
      .compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(WinkelwagenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addArtikelToWinkelwagen()', () => {
    const testArtikel = new Artikel(1, 'Test artikel', 'test', 10, 'images/foo.png', new Date(), new Date(), 'PRD1', [], 1);

    it('should call winkelwagen.addArtikel()', () => {
      const winkelwagen = service.getWinkelwagen();
      spyOn(winkelwagen, 'addArtikel');
      service.addArtikelToWinkelwagen(testArtikel);

      expect(winkelwagen.addArtikel).toHaveBeenCalledWith(testArtikel);
    });

    it('should notify listeners', () => {
      let notified = false;
      service.listen().subscribe(winkelwagen => {
        notified = true;
      });

      service.addArtikelToWinkelwagen(testArtikel);

      expect(notified).toBe(true);
    });
  });

  describe('clearWinkelwagen()', () => {
    it('Should call winkelwagen.clear()', () => {
      spyOn(service.getWinkelwagen(), 'clear');
      service.clearWinkelwagen();
      expect(service.getWinkelwagen().clear).toHaveBeenCalled();
    });

    it('Should notify listeners', () => {
      spyOn(window, 'confirm').and.callFake(() => true);
      let notified = false;
      service.listen().subscribe(winkelwagen => {
        notified = true;
      });
      service.clearWinkelwagen();
      expect(notified).toBe(true);
    });
  });
});
