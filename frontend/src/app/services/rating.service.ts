import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Rating {
  _id?: string;
  productId: string;
  supplierId: string;
  customerId: string;
  customerName?: string;
  rating: number;
  review?: string;
  qualityRating?: number;
  communicationRating?: number;
  shippingRating?: number;
  isVerifiedPurchase?: boolean;
  isApproved?: boolean;
  isHidden?: boolean;
  sellerResponse?: {
    text: string;
    respondedAt: Date;
  };
  helpfulCount?: number;
  notHelpfulCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RatingStats {
  totalReviews: number;
  averageRating: number;
  averageQualityRating?: number;
  averageCommunicationRating?: number;
  averageShippingRating?: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchaseCount: number;
  positiveRatingsPercent?: number;
}

export interface RatingResponse {
  success: boolean;
  message?: string;
  rating?: Rating;
  ratings?: Rating[];
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  stats?: RatingStats;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = `${environment.apiUrl}/ratings`;

  constructor(private http: HttpClient) { }

  /**
   * Submit a rating/review for a product
   */
  submitRating(rating: Rating): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(`${this.apiUrl}`, rating);
  }

  /**
   * Get all ratings for a product
   */
  getProductRatings(productId: string, page: number = 1, limit: number = 5): Observable<RatingResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<RatingResponse>(`${this.apiUrl}/product/${productId}`, { params });
  }

  /**
   * Get all ratings for a supplier
   */
  getSupplierRatings(supplierId: string, page: number = 1, limit: number = 10): Observable<RatingResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<RatingResponse>(`${this.apiUrl}/supplier/${supplierId}`, { params });
  }

  /**
   * Get supplier rating statistics
   */
  getSupplierStats(supplierId: string): Observable<RatingResponse> {
    return this.http.get<RatingResponse>(`${this.apiUrl}/supplier/${supplierId}/stats`);
  }

  /**
   * Get current user's ratings
   */
  getMyRatings(): Observable<RatingResponse> {
    return this.http.get<RatingResponse>(`${this.apiUrl}/customer/my-ratings`);
  }

  /**
   * Update a rating
   */
  updateRating(ratingId: string, updates: Partial<Rating>): Observable<RatingResponse> {
    return this.http.put<RatingResponse>(`${this.apiUrl}/${ratingId}`, updates);
  }

  /**
   * Delete a rating
   */
  deleteRating(ratingId: string): Observable<RatingResponse> {
    return this.http.delete<RatingResponse>(`${this.apiUrl}/${ratingId}`);
  }

  /**
   * Mark a rating as helpful
   */
  markHelpful(ratingId: string): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(`${this.apiUrl}/${ratingId}/helpful`, {});
  }

  /**
   * Mark a rating as not helpful
   */
  markNotHelpful(ratingId: string): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(`${this.apiUrl}/${ratingId}/not-helpful`, {});
  }

  /**
   * Supplier responds to a rating
   */
  respondToRating(ratingId: string, response: string): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(`${this.apiUrl}/${ratingId}/respond`, { response });
  }
}
