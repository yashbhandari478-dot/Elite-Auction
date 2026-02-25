import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getDashboardRoute(): string {
    if (!this.currentUser) return '/';
    
    switch(this.currentUser.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'supplier':
        return '/supplier/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/';
    }
  }
}
