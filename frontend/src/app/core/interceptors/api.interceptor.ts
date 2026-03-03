import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * HTTP Interceptor for standardizing API requests
 * Adds headers and handles errors uniformly
 */
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone the request and add standard headers
    const clonedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          // Backend error response
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors && Array.isArray(error.error.errors)) {
            errorMessage = error.error.errors.join(', ');
          } else {
            errorMessage = `Server Error: ${error.status} ${error.statusText}`;
          }
        }

        console.error('API Error:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
