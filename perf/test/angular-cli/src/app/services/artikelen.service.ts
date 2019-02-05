import {Injectable} from '@angular/core';
import {Artikel} from '../models/artikel';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ArtikelenService {
  private readonly url = `api/artikelen`;

  constructor(private http: HttpClient) {
  }

  getArtikelenList(): Observable<Artikel[]> {
    return this.http.get<Artikel[]>(this.url);
  }
}
