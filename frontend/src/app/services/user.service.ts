import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAllUsers(page = 1, limit = 20, search = '', role = ''): Observable<any> {
    let params: any = { page, limit };
    if (search) params['search'] = search;
    if (role) params['role'] = role;
    return this.http.get<any>(this.apiUrl, { params });
  }

  getSuppliers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/suppliers`);
  }

  getCustomers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/customers`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: { name?: string; phone?: string; address?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, data);
  }

  approveUser(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  blockUser(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/block`, {});
  }

  unblockUser(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/unblock`, {});
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
