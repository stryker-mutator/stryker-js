import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Artikel} from '../models/artikel';
import {Winkelwagen} from '../models/winkelwagen';

@Injectable({
  providedIn: 'root'
})
export class WinkelwagenService {
  private listeners = new Subject<any>();
  private winkelwagen: Winkelwagen;

  constructor() {
    this.winkelwagen = new Winkelwagen();
  }

  public listen(): Observable<Winkelwagen> {
    return this.listeners.asObservable();
  }

  public addArtikelToWinkelwagen(artikel: Artikel): void {
    this.winkelwagen.addArtikel(artikel);
    this.listeners.next(this.winkelwagen);
  }

  public getWinkelwagen(): Winkelwagen {
    return this.winkelwagen;
  }

  public clearWinkelwagen(): void {
    this.winkelwagen.clear();
    this.listeners.next(this.winkelwagen);
  }

  clearWinkelwagenNoCheck() {
    this.winkelwagen.clearNoConfirm();
    this.listeners.next(this.winkelwagen);
  }
}
