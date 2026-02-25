import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService, AnalyticsDashboard } from '../../../services/analytics.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-supplier-analytics',
  templateUrl: './supplier-analytics.component.html',
  styleUrls: ['./supplier-analytics.component.css']
})
export class SupplierAnalyticsComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  dashboard: AnalyticsDashboard['data'] | null = null;
  Math = Math; // Expose Math to template
  
  selectedTimeRange = '6m'; // 6 months, 1y, all
  selectedProductSort = 'bids'; // bids, roi, revenue
  
  private destroy$ = new Subject<void>();

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;
    
    this.analyticsService.getSupplierDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AnalyticsDashboard) => {
          this.dashboard = response.data;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to load analytics';
          this.loading = false;
        }
      });
  }

  // Summary Card Helpers
  getSummaryLabel(key: string): string {
    const labels: Record<string, string> = {
      totalRevenue: 'Total Revenue',
      supplierPayout: 'Your Payout',
      platformFees: 'Platform Fees',
      completedSales: 'Completed Sales',
      totalProducts: 'Total Products',
      conversionRate: 'Conversion Rate',
      avgOrderValue: 'Avg Order Value'
    };
    return labels[key] || key;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  }

  formatPercent(value: number): string {
    return `${parseFloat(value.toString()).toFixed(2)}%`;
  }

  // Product sorting
  getSortedProducts() {
    if (!this.dashboard?.topProducts) return [];
    const products = [...this.dashboard.topProducts];
    
    switch (this.selectedProductSort) {
      case 'roi':
        return products.sort((a, b) => {
          const roiA = a.highestBid ? ((a.highestBid - a.basePrice) / a.basePrice) * 100 : 0;
          const roiB = b.highestBid ? ((b.highestBid - b.basePrice) / b.basePrice) * 100 : 0;
          return roiB - roiA;
        });
      case 'revenue':
        return products.sort((a, b) => (b.highestBid || 0) - (a.highestBid || 0));
      case 'bids':
      default:
        return products.sort((a, b) => b.bidCount - a.bidCount);
    }
  }

  getProductROI(product: any): number {
    if (!product.highestBid) return 0;
    return ((product.highestBid - product.basePrice) / product.basePrice) * 100;
  }

  // Status badges
  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'badge-success',
      completed: 'badge-info',
      pending: 'badge-warning',
      rejected: 'badge-danger',
      sold: 'badge-info',
      unsold: 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Category performance sorting
  getSortedCategories() {
    if (!this.dashboard?.categoryPerformance) return [];
    return [...this.dashboard.categoryPerformance].sort((a, b) => b.revenue - a.revenue);
  }

  // Calculate trend percentage
  getTrendPercentage(): number {
    if (!this.dashboard?.salesTrend || this.dashboard.salesTrend.length < 2) return 0;
    const trend = this.dashboard.salesTrend;
    const lastMonth = trend[trend.length - 1].revenue;
    const secondLastMonth = trend[trend.length - 2].revenue;
    
    if (secondLastMonth === 0) return lastMonth > 0 ? 100 : 0;
    return ((lastMonth - secondLastMonth) / secondLastMonth) * 100;
  }

  getTrendDirection(): string {
    const percentage = this.getTrendPercentage();
    if (percentage > 0) return 'up';
    if (percentage < 0) return 'down';
    return 'stable';
  }

  getAbsTrendPercentage(): number {
    return Math.abs(this.getTrendPercentage());
  }
}
