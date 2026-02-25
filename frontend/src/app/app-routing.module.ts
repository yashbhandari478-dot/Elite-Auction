import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Shared Components
import { LoginComponent } from './components/shared/login/login.component';
import { RegisterComponent } from './components/shared/register/register.component';
import { WaitingApprovalComponent } from './components/shared/waiting-approval/waiting-approval.component';
import { UserProfileComponent } from './components/shared/user-profile/user-profile.component';

// Admin Components
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminCategoriesComponent } from './components/admin/admin-categories/admin-categories.component';
import { AdminAuctionsComponent } from './components/admin/admin-auctions/admin-auctions.component';
import { AdminProductsComponent } from './components/admin/admin-products/admin-products.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';

// Supplier Components
import { SupplierLayoutComponent } from './components/supplier/supplier-layout/supplier-layout.component';
import { SupplierDashboardComponent } from './components/supplier/supplier-dashboard/supplier-dashboard.component';
import { AddProductComponent } from './components/supplier/add-product/add-product.component';
import { SupplierProductDetailComponent } from './components/supplier/product-detail/product-detail.component';
import { SupplierSalesComponent } from './components/supplier/supplier-sales/supplier-sales.component';
import { SupplierAnalyticsComponent } from './components/supplier/supplier-analytics/supplier-analytics.component';
import { ScheduledProductsComponent } from './components/supplier/scheduled-products/scheduled-products.component';

// Customer Components
import { CustomerDashboardComponent } from './components/customer/customer-dashboard/customer-dashboard.component';
import { CustomerProductDetailComponent } from './components/customer/product-detail/product-detail.component';
import { MyBidsComponent } from './components/customer/my-bids/my-bids.component';
import { WonAuctionsComponent } from './components/customer/won-auctions/won-auctions.component';
import { DeliveryTrackingComponent } from './components/customer/delivery-tracking/delivery-tracking.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'waiting-approval', component: WaitingApprovalComponent },

  // Admin Routes — AdminLayoutComponent provides the sidebar shell
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'auctions', component: AdminAuctionsComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'profile', component: UserProfileComponent }
    ]
  },

  // Supplier Routes — SupplierLayoutComponent provides the sidebar shell
  {
    path: 'supplier',
    component: SupplierLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'supplier' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SupplierDashboardComponent },
      { path: 'products', component: SupplierDashboardComponent },
      { path: 'products/:id', component: SupplierProductDetailComponent },
      { path: 'add-product', component: AddProductComponent },
      { path: 'sales', component: SupplierSalesComponent },
      { path: 'analytics', component: SupplierAnalyticsComponent },
      { path: 'scheduled', component: ScheduledProductsComponent },
      { path: 'profile', component: UserProfileComponent }
    ]
  },

  // Customer Routes
  {
    path: 'customer',
    canActivate: [AuthGuard],
    data: { role: 'customer' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'product/:id', component: CustomerProductDetailComponent },
      { path: 'my-bids', component: MyBidsComponent },
      { path: 'won-auctions', component: WonAuctionsComponent },
      { path: 'tracking/:id', component: DeliveryTrackingComponent },
      { path: 'profile', component: UserProfileComponent }
    ]
  },

  // Fallback route
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
