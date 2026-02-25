import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AnalyticsSummary {
  totalRevenue: number;
  supplierPayout: number;
  platformFees: number;
  completedSales: number;
  totalProducts: number;
  conversionRate: number;
  avgOrderValue: number;
}

export interface PendingStats {
  pendingPayments: number;
  pendingDeliveries: number;
}

export interface ProductBreakdown {
  active?: number;
  pending?: number;
  completed?: number;
  rejected?: number;
}

export interface SalesTrend {
  month: string;
  sales: number;
  revenue: number;
}

export interface TopProduct {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  bidCount: number;
  saleStatus: string;
  highestBid?: number;
  status: string;
}

export interface TopCustomer {
  _id: string;
  customerName: string;
  purchases: number;
  totalSpent: number;
  avgOrderValue: number;
}

export interface AuctionMetrics {
  avgBidsPerAuction: number;
  avgBidIncrement: number;
  totalBidsReceived: number;
}

export interface CategoryPerformance {
  _id: string;
  sales: number;
  revenue: number;
  avgPrice: number;
}

export interface AnalyticsDashboard {
  success: boolean;
  data: {
    summary: AnalyticsSummary;
    pending: PendingStats;
    productBreakdown: ProductBreakdown;
    salesTrend: SalesTrend[];
    topProducts: TopProduct[];
    topCustomers: TopCustomer[];
    auctionMetrics: AuctionMetrics;
    categoryPerformance: CategoryPerformance[];
  };
}

export interface RevenueTrendResponse {
  success: boolean;
  data: Array<{
    _id: any;
    revenue: number;
    sales: number;
    avgPrice: number;
  }>;
}

export interface ProductPerformance {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  status: string;
  bidCount: number;
  highestBid?: number;
  finalPrice?: number;
  saleStatus: string;
  roi: number;
  createdAt: string;
}

export interface ProductPerformanceResponse {
  success: boolean;
  data: ProductPerformance[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive supplier analytics dashboard
   */
  getSupplierDashboard(): Observable<AnalyticsDashboard> {
    return this.http.get<AnalyticsDashboard>(`${this.apiUrl}/supplier/dashboard`);
  }

  /**
   * Get revenue trend with optional filters
   * @param startDate ISO date string
   * @param endDate ISO date string
   * @param groupBy 'day' | 'week' | 'month'
   */
  getRevenueTrend(
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Observable<RevenueTrendResponse> {
    let params = new HttpParams().set('groupBy', groupBy);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<RevenueTrendResponse>(`${this.apiUrl}/supplier/revenue-trend`, { params });
  }

  /**
   * Get product performance metrics
   */
  getProductPerformance(): Observable<ProductPerformanceResponse> {
    return this.http.get<ProductPerformanceResponse>(`${this.apiUrl}/supplier/product-performance`);
  }
}
