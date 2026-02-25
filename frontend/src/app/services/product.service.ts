import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
  }

  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/active`);
  }

  getSupplierProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/supplier/my-products`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  acceptBid(productId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/accept-bid`, {});
  }

  rejectBid(productId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/reject-bid`, {});
  }

  getPendingProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/pending`);
  }

  approveProduct(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectProduct(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, data);
  }
}
