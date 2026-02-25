import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      // Check if route has role requirement
      if (route.data['role'] && route.data['role'] !== currentUser.role) {
        // Role not authorized, redirect to home
        this.router.navigate(['/']);
        return false;
      }


      // Check if user is blocked
      if (currentUser.isBlocked) {
        this.authService.logout();
        this.router.navigate(['/login'], { queryParams: { blocked: true } });
        return false;
      }

      return true;
    }

    // Not logged in, redirect to login with return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
