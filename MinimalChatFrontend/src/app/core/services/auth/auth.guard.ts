import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  // canActivate Method
// Description: This method implements the CanActivate interface to guard routes.
// It checks if the user is logged in. If logged in, it allows access to the route.
// If not logged in, it redirects the user to the login page and denies access to the route.
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
