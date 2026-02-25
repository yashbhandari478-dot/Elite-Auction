import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid, PlaceBidRequest, BidResponse, WinningBid } from '../models/bid.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private apiUrl = `${environment.apiUrl}/bids`;

  constructor(private http: HttpClient) { }

  placeBid(bidData: PlaceBidRequest): Observable<BidResponse> {
    return this.http.post<BidResponse>(this.apiUrl, bidData);
  }

  getBidsByProduct(productId: string): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${this.apiUrl}/product/${productId}`);
  }

  getMyBids(): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${this.apiUrl}/my-bids`);
  }

  getAllBids(page = 1, limit = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`, { params: { page, limit } });
  }

  getMyWinningBids(): Observable<WinningBid[]> {
    return this.http.get<WinningBid[]>(`${this.apiUrl}/my-winning-bids`);
  }

  getSupplierWinningBids(): Observable<WinningBid[]> {
    return this.http.get<WinningBid[]>(`${this.apiUrl}/supplier-winning-bids`);
  }

  finalizeAuctions(): Observable<any> {
    return this.http.post(`${this.apiUrl}/finalize-auctions`, {});
  }

  processPayment(winningBidId: string, paymentMethod: string, deliveryAddress?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${winningBidId}/payment`, {
      paymentMethod,
      deliveryAddress
    });
  }

  getDeliveryTracking(winningBidId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${winningBidId}/tracking`);
  }

  updateDeliveryStatus(winningBidId: string, deliveryStatus: string, location?: string, description?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${winningBidId}/delivery-status`, { deliveryStatus, location, description });
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-stats`);
  }
}
