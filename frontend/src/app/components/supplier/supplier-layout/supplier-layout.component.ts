import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-supplier-layout',
    templateUrl: './supplier-layout.component.html',
    styleUrls: ['./supplier-layout.component.css']
})
export class SupplierLayoutComponent implements OnInit {
    currentUser: User | null = null;
    sidebarCollapsed = false;

    navItems = [
        { icon: '📊', label: 'Dashboard', route: '/supplier/dashboard' },
        { icon: '📦', label: 'My Products', route: '/supplier/products' },
        { icon: '➕', label: 'Add Product', route: '/supplier/add-product' },
        { icon: '🗓️', label: 'Scheduled', route: '/supplier/scheduled' },
        { icon: '💰', label: 'Sales', route: '/supplier/sales' },
        { icon: '📈', label: 'Analytics', route: '/supplier/analytics' },
        { icon: '⚙️', label: 'My Profile', route: '/supplier/profile' },
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
