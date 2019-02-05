import {Observable} from 'rxjs';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';

@Injectable(
  { providedIn: 'root'}
)
export class DirectAccessGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // If the previous URL was blank, then the user is directly accessing this page
    if (this.router.url === '/') {
      this.router.navigate(['/catalogus']); // Navigate away to some other page
      return false;
    }
    return true;
  }
}
