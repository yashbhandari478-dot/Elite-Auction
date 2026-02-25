import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
    user: User | null = null;
    loading = false;
    profileLoading = false;
    passwordLoading = false;
    successMessage = '';
    error = '';
    passwordError = '';
    passwordSuccess = '';

    // Profile form
    profileForm = {
        name: '',
        phone: '',
        address: ''
    };

    // Change password form
    passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    showPasswordSection = false;

    constructor(
        private userService: UserService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.loading = true;
        this.userService.getProfile().subscribe({
            next: (res: any) => {
                this.user = res.user;
                this.profileForm = {
                    name: res.user.name || '',
                    phone: res.user.phone || '',
                    address: res.user.address || ''
                };
                this.loading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to load profile';
                this.loading = false;
            }
        });
    }

    updateProfile(): void {
        if (!this.profileForm.name.trim()) {
            this.error = 'Name cannot be empty';
            return;
        }
        this.profileLoading = true;
        this.error = '';
        this.userService.updateProfile(this.profileForm).subscribe({
            next: (res: any) => {
                this.user = res.user;
                // Update localStorage cached user name
                const stored = localStorage.getItem('currentUser');
                if (stored) {
                    const cached = JSON.parse(stored);
                    cached.name = res.user.name;
                    localStorage.setItem('currentUser', JSON.stringify(cached));
                }
                this.showSuccess('Profile updated successfully!');
                this.profileLoading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to update profile';
                this.profileLoading = false;
            }
        });
    }

    changePassword(): void {
        this.passwordError = '';
        if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
            this.passwordError = 'Please fill in all password fields';
            return;
        }
        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
            this.passwordError = 'New passwords do not match';
            return;
        }
        if (this.passwordForm.newPassword.length < 6) {
            this.passwordError = 'New password must be at least 6 characters';
            return;
        }
        this.passwordLoading = true;
        this.authService.changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword).subscribe({
            next: () => {
                this.passwordSuccess = 'Password changed successfully!';
                this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
                this.passwordLoading = false;
                setTimeout(() => this.passwordSuccess = '', 4000);
            },
            error: (err) => {
                this.passwordError = err.error?.message || 'Failed to change password';
                this.passwordLoading = false;
            }
        });
    }

    private showSuccess(msg: string): void {
        this.successMessage = msg;
        setTimeout(() => this.successMessage = '', 4000);
    }

    getRoleLabel(): string {
        if (!this.user) return '';
        const labels: Record<string, string> = { admin: '🔑 Admin', supplier: '🏪 Supplier', customer: '🛒 Customer' };
        return labels[this.user.role] || this.user.role;
    }
}
