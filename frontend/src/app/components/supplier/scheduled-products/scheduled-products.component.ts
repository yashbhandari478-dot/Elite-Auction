import { Component, OnInit, OnDestroy } from '@angular/core';
import { SchedulingService, Product, ScheduleResponse } from '../../../services/scheduling.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-scheduled-products',
  templateUrl: './scheduled-products.component.html',
  styleUrls: ['./scheduled-products.component.css']
})
export class ScheduledProductsComponent implements OnInit, OnDestroy {
  scheduledProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  selectedProduct: Product | null = null;
  showRescheduleModal = false;
  newScheduledTime = '';
  rescheduleLoading = false;

  private destroy$ = new Subject<void>();

  constructor(private schedulingService: SchedulingService) {}

  ngOnInit(): void {
    this.loadScheduledProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadScheduledProducts(): void {
    this.loading = true;
    this.error = null;

    this.schedulingService.getScheduledProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          this.scheduledProducts = products;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to load scheduled products';
          this.loading = false;
        }
      });
  }

  openRescheduleModal(product: Product): void {
    this.selectedProduct = product;
    this.newScheduledTime = product.scheduledActivationTime
      ? new Date(product.scheduledActivationTime).toISOString().slice(0, 16)
      : '';
    this.showRescheduleModal = true;
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.selectedProduct = null;
    this.newScheduledTime = '';
  }

  rescheduleProduct(): void {
    if (!this.selectedProduct || !this.newScheduledTime) {
      this.error = 'Please select a valid date and time';
      return;
    }

    this.rescheduleLoading = true;

    this.schedulingService.rescheduleProduct(
      this.selectedProduct._id,
      new Date(this.newScheduledTime).toISOString()
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ScheduleResponse) => {
          this.successMessage = response.message;
          this.rescheduleLoading = false;
          this.closeRescheduleModal();
          this.loadScheduledProducts();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to reschedule product';
          this.rescheduleLoading = false;
        }
      });
  }

  cancelScheduling(product: Product): void {
    if (!confirm(`Cancel scheduling for "${product.name}"?`)) return;

    this.schedulingService.cancelScheduling(product._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ScheduleResponse) => {
          this.successMessage = response.message;
          this.loadScheduledProducts();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to cancel scheduling';
        }
      });
  }

  formatDateTime(date: string | Date | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getTimeUntilActivation(scheduledTime: string | Date | undefined): string {
    if (!scheduledTime) return '—';
    
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    const diff = scheduled.getTime() - now.getTime();

    if (diff < 0) return 'Overdue';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  isProductOverdue(scheduledTime: string | Date | undefined): boolean {
    if (!scheduledTime) return false;
    return new Date(scheduledTime) < new Date();
  }
}
