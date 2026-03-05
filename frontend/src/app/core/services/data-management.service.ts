import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DataManagementService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  exportData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/export`);
  }

  importData(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/import`, payload);
  }

  seedData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, {});
  }

  resetData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, {});
  }
}
