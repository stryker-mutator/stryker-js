import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {KlantgegevensFormulierComponent} from './klantgegevens-formulier.component';
import {ReactiveFormsModule} from '@angular/forms';
import {WinkelwagenService} from '../../services/winkelwagen.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BestellingenService} from '../../services/bestellingen.service';
import {Klant} from '../../models/bestelling/klant';
import {Land} from '../../models/bestelling/land';
import {of} from 'rxjs';
import {Artikel} from '../../models/artikel';
import {RouterTestingModule} from '@angular/router/testing';
import {Bestelling} from '../../models/bestelling/bestelling';

describe('KlantgegevensFormulierComponent', () => {
  let component: KlantgegevensFormulierComponent;
  let fixture: ComponentFixture<KlantgegevensFormulierComponent>;
  let bestellingenServive: BestellingenService;
  const testArtikel = new Artikel(1, 'fiets bel', '', 15.00, '', new Date(1, 9, 2019), new Date(1, 9, 2020), 'AB', ['fietsen'], 10);
  const testKlant = new Klant('foo', 'bar', 'straat', '1', 'A', 'plaats', Land.NL, 'email@email.nl', '0644877514');
  /**
   * Gets a element in the native element
   * @param querySelector The query selector of the element
   */
  const getElement = (querySelector: string): HTMLElement => {
    return fixture.debugElement.nativeElement.querySelector(querySelector);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KlantgegevensFormulierComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [WinkelwagenService, BestellingenService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KlantgegevensFormulierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    bestellingenServive = TestBed.get(BestellingenService);
    component.winkelwagen.setWinkelwagenRegels([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('list of landen should contain nl be and de', () => {
    const landen = component.landen;
    expect(landen[0].landCode).toBe('NL');
    expect(landen[1].landCode).toBe('BE');
    expect(landen[2].landCode).toBe('DE');
    expect(landen[0].landNaam).toBe('Nederland');
    expect(landen[1].landNaam).toBe('België');
    expect(landen[2].landNaam).toBe('Duitsland');
  });

  it('list of landen should have a size of 3', () => {
    const landen = component.landen;
    expect(landen.length).toBe(3);
  });

  describe('ngOnInit()', () => {
    it('Winkelwagen should be created', () => {
      component.ngOnInit();
      expect(component.winkelwagen).toBeDefined();
    });
  });

  describe('bestellingPlaatsen()', () => {
    it('bestellingenService.plaatsBestelling should be called', () => {
      const bestelling = new Bestelling(testKlant, component.getBestelRegels(), 15);
      spyOn(bestellingenServive, 'plaatsBestelling').and.returnValue(of(bestelling));
      spyOn(component, 'getBestelRegels');
      component.bestellingPlaatsen(testKlant);
      expect(bestellingenServive.plaatsBestelling).toHaveBeenCalled();
      expect(component.getBestelRegels).toHaveBeenCalled();
    });
    it('alert("Bestelling is geplaatst") should be called', () => {
      const bestelling = new Bestelling(testKlant, component.getBestelRegels(), 15);
      component.winkelwagen.addArtikel(testArtikel);
      spyOn(bestellingenServive, 'plaatsBestelling').and.returnValue(of(bestelling));
      spyOn(component.router, 'navigate');
      component.bestellingPlaatsen(testKlant);
      expect(component.router.navigate).toHaveBeenCalledWith(['/bestelling-factuur']);
    });
  });

  describe('klantGegevensForm', () => {
    it('form invalid when empty', () => {
      expect(component.klantGegevensForm.valid).toBeFalsy();
    });

    it('form with valid data should be valid', () => {
      component.klantGegevensForm.get('voornaam').setValue('foo');
      component.klantGegevensForm.get('achternaam').setValue('bar');
      component.klantGegevensForm.get('straat').setValue('straat');
      component.klantGegevensForm.get('huisnummer').setValue('1');
      component.klantGegevensForm.get('huisnummertoevoeging').setValue('A');
      component.klantGegevensForm.get('postcode').setValue('5487AB');
      component.klantGegevensForm.get('plaats').setValue('Plaats');
      component.klantGegevensForm.get('land').setValue('Nederland');
      component.klantGegevensForm.get('emailadres').setValue('foobar@email.nl');
      component.klantGegevensForm.get('telefoonnummer').setValue('0644877521');
      expect(component.klantGegevensForm.valid).toBeTruthy();
    });

    it('form with invalid data should be invalid', () => {
      component.klantGegevensForm.get('voornaam').setValue('123');
      component.klantGegevensForm.get('achternaam').setValue('');
      component.klantGegevensForm.get('straat').setValue('A');
      component.klantGegevensForm.get('huisnummer').setValue('A');
      component.klantGegevensForm.get('huisnummertoevoeging').setValue('A');
      component.klantGegevensForm.get('postcode').setValue('4545FOO');
      component.klantGegevensForm.get('plaats').setValue('A');
      component.klantGegevensForm.get('land').setValue('');
      component.klantGegevensForm.get('emailadres').setValue('foobaremail.nl');
      component.klantGegevensForm.get('telefoonnummer').setValue('0633877452622');
      expect(component.klantGegevensForm.valid).toBeFalsy();
    });

    it('field with invalid data should be invalid', () => {
      component.klantGegevensForm.get('voornaam').setValue('123');
      component.klantGegevensForm.get('achternaam').setValue('123');
      component.klantGegevensForm.get('straat').setValue('A');
      component.klantGegevensForm.get('huisnummer').setValue('A');
      component.klantGegevensForm.get('huisnummertoevoeging').setValue('A');
      component.klantGegevensForm.get('postcode').setValue('4545FOOO');
      component.klantGegevensForm.get('plaats').setValue('A');
      component.klantGegevensForm.get('land').setValue('');
      component.klantGegevensForm.get('emailadres').setValue('foobaremail.nl');
      component.klantGegevensForm.get('telefoonnummer').setValue('063a387791');

      expect(component.klantGegevensForm.get('voornaam').valid).toBeFalsy();
      expect(component.klantGegevensForm.get('achternaam').valid).toBeFalsy();
      expect(component.klantGegevensForm.get('straat').valid).toBeFalsy();
      expect(component.klantGegevensForm.get('huisnummer').valid).toBeFalsy();
      expect(component.klantGegevensForm.get('postcode').valid).toBeFalsy();
      expect(component.klantGegevensForm.get('plaats').valid).toBeFalsy();
      expect(component.klantGegevensForm.get('land').valid).toBeFalsy();
      expect(component.klantGegevensForm.get('emailadres').valid).toBeFalsy();
    });

    it('fields shoudl have correct a correct default value', () => {
      const voornaam = component.klantGegevensForm.get('voornaam').value;
      const achternaam = component.klantGegevensForm.get('achternaam').value;
      const straat = component.klantGegevensForm.get('straat').value;
      const huisnummer = component.klantGegevensForm.get('huisnummer').value;
      const huisnummertoevoeging = component.klantGegevensForm.get('huisnummertoevoeging').value;
      const postcode = component.klantGegevensForm.get('postcode').value;
      const plaats = component.klantGegevensForm.get('plaats').value;
      const land = component.klantGegevensForm.get('land').value;
      const emailadres = component.klantGegevensForm.get('emailadres').value;
      const telefoonnummer = component.klantGegevensForm.get('telefoonnummer').value;

      expect(voornaam).toBe('');
      expect(achternaam).toBe('');
      expect(straat).toBe('');
      expect(huisnummer).toBe('');
      expect(postcode).toBe('');
      expect(huisnummertoevoeging).toBe('');
      expect(plaats).toBe('');
      expect(land).toBe('NL');
      expect(emailadres).toBe('');
      expect(telefoonnummer).toBe('');
    });
  });
  describe('getBestelRegels()', () => {
    it('winkelwagenregels should be 0 ', () => {
      expect(component.getBestelRegels().length).toBe(0);
    });
    it('winkelwagenregels should be 2 ', () => {
      component.winkelwagen.addArtikel(testArtikel);
      component.winkelwagen.addArtikel(testArtikel);
      expect(component.getBestelRegels().length).toBe(1);
      expect(component.winkelwagen.getWinkelwagenRegels()[0].aantal).toBe(2);
    });
  });
  describe('css testing', () => {
    it('form labels should have line-hight: 35px', () => {
      const element = getElement('span.label');
      const computedElement = getComputedStyle(element);
      expect(computedElement.lineHeight).toBe('35px');
    });
  });
});
