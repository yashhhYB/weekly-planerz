import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  TeamMember,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  ApiResponse
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/team`;

  constructor(private http: HttpClient) {}

  getAllMembers(): Observable<TeamMember[]> {
    return this.http.get<ApiResponse<TeamMember[]>>(this.apiUrl).pipe(
      map(res => res.data ?? [])
    );
  }

  getMemberById(id: string): Observable<TeamMember> {
    return this.http.get<ApiResponse<TeamMember>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data!)
    );
  }

  createMember(request: CreateTeamMemberRequest): Observable<TeamMember> {
    return this.http.post<ApiResponse<TeamMember>>(this.apiUrl, request).pipe(
      map(res => res.data!)
    );
  }

  updateMember(id: string, request: UpdateTeamMemberRequest): Observable<TeamMember> {
    return this.http.put<ApiResponse<TeamMember>>(`${this.apiUrl}/${id}`, request).pipe(
      map(res => res.data!)
    );
  }

  deleteMember(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data ?? false)
    );
  }

  setTeamLead(id: string): Observable<TeamMember> {
    return this.http.put<ApiResponse<TeamMember>>(`${this.apiUrl}/${id}/role`, {}).pipe(
      map(res => res.data!)
    );
  }
}
