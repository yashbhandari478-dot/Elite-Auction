import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  status: string;
  isScheduled: boolean;
  scheduledActivationTime?: Date;
}

export interface ScheduleResponse {
  success: boolean;
  message: string;
  product?: Product;
}

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Get all scheduled products for current supplier
   */
  getScheduledProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/supplier/scheduled`);
  }

  /**
   * Schedule a product for future activation
   * @param productId The product ID to schedule
   * @param scheduledActivationTime ISO date string for activation
   */
  scheduleProduct(productId: string, scheduledActivationTime: string): Observable<ScheduleResponse> {
    return this.http.post<ScheduleResponse>(`${this.apiUrl}/${productId}/schedule`, {
      scheduledActivationTime
    });
  }

  /**
   * Reschedule an already scheduled product
   * @param productId The product ID to reschedule
   * @param scheduledActivationTime ISO date string for new activation
   */
  rescheduleProduct(productId: string, scheduledActivationTime: string): Observable<ScheduleResponse> {
    return this.http.put<ScheduleResponse>(`${this.apiUrl}/${productId}/reschedule`, {
      scheduledActivationTime
    });
  }

  /**
   * Cancel the scheduling for a product
   * @param productId The product ID
   */
  cancelScheduling(productId: string): Observable<ScheduleResponse> {
    return this.http.delete<ScheduleResponse>(`${this.apiUrl}/${productId}/cancel-schedule`);
  }
}
