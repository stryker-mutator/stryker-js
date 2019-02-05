import {Land} from './land';

export class Klant {
  constructor(public voornaam: string,
              public achternaam: string,
              public straat: string,
              public huisnummer: string,
              public huisnummertoevoeging: string,
              public plaats: string,
              public land: Land,
              public emailadres: string,
              public telefoonnummer: string) {
  }

}
