import {Klant} from './klant';
import {BestelRegel} from './bestelRegel';

export class Bestelling {
  constructor(public klant: Klant, public bestelregels: BestelRegel[], public totaalprijs: number) {
  }
}
