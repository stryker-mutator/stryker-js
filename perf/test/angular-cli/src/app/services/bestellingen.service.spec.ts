import {TestBed} from '@angular/core/testing';
import {BestellingenService} from './bestellingen.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Bestelling} from '../models/bestelling/bestelling';
import {Klant} from '../models/bestelling/klant';
import {Land} from '../models/bestelling/land';
import {BestelRegel} from '../models/bestelling/bestelRegel';

describe('BestellingenService', () => {
  let httpMock: HttpTestingController;
  let service: BestellingenService;
  let testBestelling: Bestelling;
  const testBestelRegel = new BestelRegel(1, 1);
  const testKlant = new Klant('foo', 'bar', 'straat', '1', 'A', 'plaats', Land.NL, 'email@email.nl', '0644877514');

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  }));

  beforeEach(() => {
    service = TestBed.get(BestellingenService);
    httpMock = TestBed.get(HttpTestingController);
    testBestelling = new Bestelling(testKlant, [testBestelRegel], 10);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('plaatsBestelling()', () => {
    it('should return artikel list of 4 elements', () => {
      service.plaatsBestelling(testBestelling).subscribe(response => {
        expect(response.bestelregels.length).toBe(1);
        expect(response.klant.voornaam).toBe('foo');
      });
      httpMock.expectOne('api/bestellingen').flush(testBestelling);
    });
  });
});
