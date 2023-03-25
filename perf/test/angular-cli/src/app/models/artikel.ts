export class Artikel {

  constructor(public artikelNummer: number,
              public naam: string,
              public beschrijving: string,
              public prijs: number,
              public afbeeldingUrl: string,
              public leverbaarVanaf: Date,
              public leverbaarTot: Date,
              public leverancierCode: string,
              public categorie: string[],
              public aantal: number) {
  }
}
