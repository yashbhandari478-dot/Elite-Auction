import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        let errorMessage = 'An unknown error occurred';

        if (err.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = err.error.message;
        } else {
          // Server-side error
          if (err.status === 0) {
            errorMessage = 'Unable to connect to server. Please make sure the backend is running.';
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.statusText) {
            errorMessage = err.statusText;
          } else {
            errorMessage = `Error: ${err.status}`;
          }
        }

        if (err.status === 401) {
          // Auto logout if 401 response returned from api
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        return throwError(() => errorMessage);
      })
    );
  }
}

