import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Klant} from '../../models/bestelling/klant';
import {Bestelling} from '../../models/bestelling/bestelling';
import {WinkelwagenService} from '../../services/winkelwagen.service';
import {Winkelwagen} from '../../models/winkelwagen';
import {BestelRegel} from '../../models/bestelling/bestelRegel';
import {BestellingenService} from '../../services/bestellingen.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ksw-klantgegevens-formulier',
  templateUrl: './klantgegevens-formulier.component.html',
  styleUrls: ['./klantgegevens-formulier.component.scss']
})
export class KlantgegevensFormulierComponent implements OnInit {
  public winkelwagen: Winkelwagen;
  public klantGegevensForm: FormGroup;
  public landen = [
    {landNaam: 'Nederland', landCode: 'NL'},
    {landNaam: 'België', landCode: 'BE'},
    {landNaam: 'Duitsland', landCode: 'DE'}
  ];

  constructor(private fb: FormBuilder, private winkelwagenService: WinkelwagenService, private bestellingenService: BestellingenService, public router: Router) {
    this.klantGegevensForm = fb.group({
      voornaam: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z-]*\\s?[a-zA-Z-]*'),
        Validators.minLength(2),
        Validators.maxLength(30)]),
      achternaam: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z-]*\\s?[a-zA-Z-]*'),
        Validators.minLength(2),
        Validators.maxLength(50)]),
      straat: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)]),
      huisnummer: new FormControl('', [
        Validators.required,
        Validators.pattern('[1-9]{1}[0-9]*$')]),
      huisnummertoevoeging: new FormControl('',),
      postcode: new FormControl('', [
        Validators.required,
        Validators.pattern('^[1-9][0-9]{3} ?([a-zA-Z]{2})?')]),
      plaats: new FormControl('', [
        Validators.required, Validators.minLength(2),
        Validators.maxLength(50)]),
      land: new FormControl('NL', [
        Validators.required]),
      emailadres: new FormControl('', [
        Validators.required,
        Validators.pattern('.+@.+\\..+')]),
      telefoonnummer: new FormControl('', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[+]?[0-9]{9,}')])
    });
  }

  ngOnInit() {
    this.winkelwagen = this.winkelwagenService.getWinkelwagen();
  }

  bestellingPlaatsen(klant: Klant) {
    const bestelling = new Bestelling(klant, this.getBestelRegels(), this.winkelwagen.getTotaalPrijs());
    this.bestellingenService.plaatsBestelling(bestelling).subscribe(response => {
        if (bestelling.totaalprijs === response.totaalprijs) {
          this.winkelwagenService.clearWinkelwagenNoCheck();
          this.router.navigate(['/bestelling-factuur']);
        }
      },
      () => {
        alert('Systeemfout: Bestelling is niet geplaatst');
      });
  }

  getBestelRegels() {
    const regels = [];
    for (const regel of this.winkelwagen.getWinkelwagenRegels()) {
      regels.push(new BestelRegel(regel.artikel.artikelNummer, regel.aantal));
    }
    return regels;
  }
}
