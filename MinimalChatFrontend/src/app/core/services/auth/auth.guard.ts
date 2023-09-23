import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.userService. isLoggedIn()) {
      return true; // Allow access
    } else {
      // Redirect to the login page or show an unauthorized message
      this.router.navigate(['/login']);
      return false; // Prevent access
    }
  }
}
