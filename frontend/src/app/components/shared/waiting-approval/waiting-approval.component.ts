import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-waiting-approval',
    template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body text-center p-5">
              <div class="mb-4">
                <i class="fas fa-clock text-warning" style="font-size: 4rem;"></i>
              </div>
              <h2 class="card-title mb-4">Account Pending Approval</h2>
              <p class="card-text lead mb-4">
                Thank you for registering! Your account is currently under review by our administrators.
              </p>
              <p class="card-text text-muted mb-5">
                Please wait for an administrator to approve your account. You will be able to access the dashboard once approved.
              </p>
              <div class="d-grid gap-2">
                <button (click)="logout()" class="btn btn-outline-primary">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .card { border-radius: 1rem; border: none; }
    .btn { border-radius: 0.5rem; padding: 0.75rem; }
  `]
})
export class WaitingApprovalComponent {
    constructor(public authService: AuthService, private router: Router) { }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
