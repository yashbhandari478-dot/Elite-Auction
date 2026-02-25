import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
    currentUser: User | null = null;
    sidebarCollapsed = false;

    navItems = [
        { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
        { icon: '👥', label: 'Users', route: '/admin/users' },
        { icon: '📦', label: 'Approve Products', route: '/admin/products' },
        { icon: '🏷️', label: 'Categories', route: '/admin/categories' },
        { icon: '🔨', label: 'Auctions', route: '/admin/auctions' },
        { icon: '⚙️', label: 'My Profile', route: '/admin/profile' },
    ];

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        this.authService.currentUser.subscribe(user => this.currentUser = user);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }
}
