import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {CatalogusComponent} from './catalogus.component';
import {ArtikelenService} from '../services/artikelen.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Artikel} from '../models/artikel';
import {CatalogusArtikelComponent} from './catalogus-artikel/catalogus-artikel.component';
import {of, throwError} from 'rxjs';

describe('CatalogusComponent', () => {
  let component: CatalogusComponent;
  let fixture: ComponentFixture<CatalogusComponent>;
  let service: ArtikelenService;

  /**
   * Gets a element in the native element
   * @param querySelector The query selector of the element
   */
  const getElement = (querySelector: string): HTMLElement => {
    return fixture.debugElement.nativeElement.querySelector(querySelector);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CatalogusComponent, CatalogusArtikelComponent],
      imports: [HttpClientTestingModule, HttpClientTestingModule],
      providers: [ArtikelenService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.get(ArtikelenService);
  });

  it('should create CatalogusComponent', () => {
    expect(component).toBeTruthy();
  });
  describe('fetchArtikelen()', () => {
    it('should return artikel list of 4 elements', () => {
      // Arrange
      const testData = of([
        new Artikel(1, 'fiets bel', '', 15.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'AB', ['fietsen'], 10),
        new Artikel(2, 'fiets band', '', 8.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'BC', ['fietsen'], 10),
        new Artikel(3, 'fiets helm', '', 12.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'BC', ['fietsen'], 10),
        new Artikel(4, 'fiets', '', 200.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'AB', ['fietsen'], 10)
      ]);
      spyOn(service, 'getArtikelenList').and.returnValue(testData);
      // Act
      component.fetchArtikelen();
      const result = component.artikelen;
      // Assert
      expect(result.length).toBe(4);
      expect(result[0].naam).toBe('fiets bel');
      expect(result[1].naam).toBe('fiets band');
      expect(result[2].naam).toBe('fiets helm');
      expect(result[3].naam).toBe('fiets');
    });
    it('should return error message', async () => {
      spyOn(service, 'getArtikelenList').and.returnValue(throwError({error: 'test Error'}));
      spyOn(console, 'error');
      component.fetchArtikelen();
      const result = component.artikelen;
      expect(result.length).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Server error occurred: test Error');
    });
  });

  describe('ngOnInit()', () => {
    it('Artikelen list should be created', () => {
      component.ngOnInit();
      expect(component.artikelen.length).toBe(0);
    });
    it('Check if fetchArtikelen() is called', () => {
      spyOn(component, 'fetchArtikelen');
      component.ngOnInit();
      expect(component.fetchArtikelen).toHaveBeenCalled();
    });
  });
  describe('css testing', () => {
    it('#catalogus should have display: flex', async () => {
      const element = getElement('#catalogus');
      const computedElement = getComputedStyle(element);
      expect(computedElement.display).toBe('flex');
    });
  });
});
