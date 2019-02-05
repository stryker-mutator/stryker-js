import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Bestelling} from '../models/bestelling/bestelling';

@Injectable({
  providedIn: 'root'
})
export class BestellingenService {

  private readonly url = `api/bestellingen`;

  constructor(private http: HttpClient) {
  }

  plaatsBestelling(bestelling: Bestelling): Observable<Bestelling> {
    return this.http.post<Bestelling>(this.url, bestelling);
  }
}
