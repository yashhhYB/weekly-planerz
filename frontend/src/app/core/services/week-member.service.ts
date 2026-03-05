import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  WeekMember,
  MemberTask,
  AssignTaskRequest,
  UpdateProgressRequest,
  Dashboard,
  ApiResponse
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class WeekMemberService {
  private apiUrl = `${environment.apiUrl}/planning`;

  constructor(private http: HttpClient) {}

  getWeekMembers(weekId: string): Observable<WeekMember[]> {
    return this.http.get<ApiResponse<WeekMember[]>>(`${this.apiUrl}/${weekId}/members`).pipe(
      map(res => res.data ?? [])
    );
  }

  addWeekMembers(weekId: string, memberIds: string[]): Observable<WeekMember[]> {
    return this.http.post<ApiResponse<WeekMember[]>>(`${this.apiUrl}/${weekId}/members`, memberIds).pipe(
      map(res => res.data ?? [])
    );
  }

  getWeekMember(weekMemberId: string): Observable<WeekMember> {
    return this.http.get<ApiResponse<WeekMember>>(`${this.apiUrl}/members/${weekMemberId}`).pipe(
      map(res => res.data!)
    );
  }

  assignTask(weekMemberId: string, request: AssignTaskRequest): Observable<MemberTask> {
    return this.http.post<ApiResponse<MemberTask>>(`${this.apiUrl}/members/${weekMemberId}/tasks`, request).pipe(
      map(res => res.data!)
    );
  }

  removeTask(taskId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/tasks/${taskId}`).pipe(
      map(res => res.data ?? false)
    );
  }

  submitPlan(weekMemberId: string): Observable<WeekMember> {
    return this.http.post<ApiResponse<WeekMember>>(`${this.apiUrl}/members/${weekMemberId}/submit`, {}).pipe(
      map(res => res.data!)
    );
  }

  updateProgress(taskId: string, request: UpdateProgressRequest): Observable<MemberTask> {
    return this.http.put<ApiResponse<MemberTask>>(`${this.apiUrl}/tasks/${taskId}/progress`, request).pipe(
      map(res => res.data!)
    );
  }

  getDashboard(weekId: string): Observable<Dashboard> {
    return this.http.get<ApiResponse<Dashboard>>(`${this.apiUrl}/${weekId}/dashboard`).pipe(
      map(res => res.data!)
    );
  }
}
