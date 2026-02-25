import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Interceptors
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Pipes
import { ProductFilterPipe } from './pipes/product-filter.pipe';
import { StatusFilterPipe } from './pipes/status-filter.pipe';
import { ToMaxValuePipe } from './pipes/to-max-value.pipe';

// Shared Components
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { LoginComponent } from './components/shared/login/login.component';
import { RegisterComponent } from './components/shared/register/register.component';
import { WaitingApprovalComponent } from './components/shared/waiting-approval/waiting-approval.component';
import { UserProfileComponent } from './components/shared/user-profile/user-profile.component';
import { RatingSubmissionComponent } from './components/shared/rating-submission/rating-submission.component';
import { RatingDisplayComponent } from './components/shared/rating-display/rating-display.component';

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

@NgModule({
  declarations: [
    AppComponent,
    // Shared
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    WaitingApprovalComponent,
    UserProfileComponent,
    RatingSubmissionComponent,
    RatingDisplayComponent,
    // Admin
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminCategoriesComponent,
    AdminAuctionsComponent,
    AdminProductsComponent,
    AdminUsersComponent,
    // Supplier
    SupplierLayoutComponent,
    SupplierDashboardComponent,
    AddProductComponent,
    SupplierProductDetailComponent,
    SupplierSalesComponent,
    SupplierAnalyticsComponent,
    ScheduledProductsComponent,
    // Customer
    CustomerDashboardComponent,
    CustomerProductDetailComponent,
    MyBidsComponent,
    WonAuctionsComponent,
    DeliveryTrackingComponent,
    // Pipes
    ProductFilterPipe,
    StatusFilterPipe,
    ToMaxValuePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
