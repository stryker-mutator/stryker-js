import {Component, OnInit} from '@angular/core';
import {ArtikelenService} from '../services/artikelen.service';
import {Artikel} from '../models/artikel';

@Component({
  selector: 'ksw-catalogus',
  templateUrl: './catalogus.component.html',
  styleUrls: ['./catalogus.component.scss']
})
export class CatalogusComponent implements OnInit {
  public artikelen: Artikel[];

  constructor(private artikelenService: ArtikelenService) {
  }

  ngOnInit() {
    this.artikelen = [];
    this.fetchArtikelen();
  }

  public fetchArtikelen() {
    this.artikelenService.getArtikelenList().subscribe(response => {
        this.artikelen = response;
      },
      error => {
        console.error(`Server error occurred: ${error.error}`);
      });
  }
}
