import {TestBed} from '@angular/core/testing';
import {ArtikelenService} from './artikelen.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Artikel} from '../models/artikel';

describe('ArtikelenService', () => {
  let service: ArtikelenService;
  let httpMock: HttpTestingController;
  const testData: Artikel[] = [
    new Artikel(1, 'fiets bel', '', 15.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'AB', ['fietsen'], 10),
    new Artikel(2, 'fiets band', '', 8.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'BC', ['fietsen'], 10),
    new Artikel(3, 'fiets helm', '', 12.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'BC', ['fietsen'], 10),
    new Artikel(4, 'fiets', '', 200.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'AB', ['fietsen'], 10)
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(ArtikelenService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('getArtikelenList()', () => {
    it('should return artikel list of 4 elements', () => {
      service.getArtikelenList().subscribe(response => {
        expect(response.length).toBe(4);
        expect(response[0].naam).toBe('fiets bel');
        expect(response[1].naam).toBe('fiets band');
        expect(response[2].naam).toBe('fiets helm');
        expect(response[3].naam).toBe('fiets');
      });
      httpMock.expectOne('api/artikelen').flush(testData);
    });
  });
});
