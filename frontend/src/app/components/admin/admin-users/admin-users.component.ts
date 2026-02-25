import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  successMessage = '';
  searchTerm = '';
  roleFilter = '';
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  limit = 15;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.userService.getAllUsers(this.currentPage, this.limit, this.searchTerm, this.roleFilter)
      .subscribe({
        next: (res: any) => {
          if (res.users) {
            this.users = res.users;
            this.totalPages = res.pages || 1;
            this.totalUsers = res.total || 0;
          } else {
            this.users = res;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load users';
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  approveUser(userId: string): void {
    this.userService.approveUser(userId).subscribe({
      next: () => { this.showSuccess('User approved.'); this.loadUsers(); },
      error: (err) => this.error = err.error?.message || 'Failed to approve user'
    });
  }

  blockUser(user: User): void {
    if (!confirm(`Block ${user.name}?`)) return;
    this.userService.blockUser(user._id!).subscribe({
      next: () => { this.showSuccess(`${user.name} blocked.`); this.loadUsers(); },
      error: (err) => this.error = err.error?.message || 'Failed to block user'
    });
  }

  unblockUser(user: User): void {
    this.userService.unblockUser(user._id!).subscribe({
      next: () => { this.showSuccess(`${user.name} unblocked.`); this.loadUsers(); },
      error: (err) => this.error = err.error?.message || 'Failed to unblock user'
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Permanently delete ${user.name}?`)) return;
    this.userService.deleteUser(user._id!).subscribe({
      next: () => { this.showSuccess(`${user.name} deleted.`); this.loadUsers(); },
      error: (err) => this.error = err.error?.message || 'Failed to delete user'
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
