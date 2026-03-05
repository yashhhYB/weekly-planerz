import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  PlanningWeek,
  PlanningWeekDto,
  PlanningStatus,
  CreatePlanningWeekRequest,
  UpdatePlanningWeekRequest,
  ApiResponse
} from '../../models';

/**
 * Service for managing Planning Week operations
 * Handles all API interactions with the planning week endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private apiUrl = `${environment.apiUrl}/planning`;

  constructor(private http: HttpClient) {}

  /**
   * Get all planning weeks
   */
  getAllPlanningWeeks(): Observable<PlanningWeek[]> {
    return this.http
      .get<ApiResponse<PlanningWeekDto[]>>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map(dto => this.mapDtoToDomain(dto));
          }
          return [];
        })
      );
  }

  /**
   * Get a specific planning week by ID
   */
  getPlanningWeekById(id: string): Observable<PlanningWeek> {
    return this.http
      .get<ApiResponse<PlanningWeekDto>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error('Failed to fetch planning week');
        })
      );
  }

  /**
   * Create a new planning week
   */
  createPlanningWeek(request: CreatePlanningWeekRequest): Observable<PlanningWeek> {
    return this.http
      .post<ApiResponse<PlanningWeekDto>>(`${this.apiUrl}`, request)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error(response.message || 'Failed to create planning week');
        })
      );
  }

  /**
   * Update an existing planning week
   */
  updatePlanningWeek(
    id: string,
    request: UpdatePlanningWeekRequest
  ): Observable<PlanningWeek> {
    return this.http
      .put<ApiResponse<PlanningWeekDto>>(`${this.apiUrl}/${id}`, request)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error(response.message || 'Failed to update planning week');
        })
      );
  }

  /**
   * Freeze a planning week (prevent further modifications)
   */
  freezePlanningWeek(id: string): Observable<PlanningWeek> {
    return this.http
      .post<ApiResponse<PlanningWeekDto>>(`${this.apiUrl}/${id}/freeze`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error('Failed to freeze planning week');
        })
      );
  }

  /**
   * Delete a planning week
   */
  startPlanningWeek(id: string): Observable<PlanningWeek> {
    return this.http
      .post<ApiResponse<PlanningWeekDto>>(`${this.apiUrl}/${id}/start`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error(response.message || 'Failed to start planning week');
        })
      );
  }

  completePlanningWeek(id: string): Observable<PlanningWeek> {
    return this.http
      .post<ApiResponse<PlanningWeekDto>>(`${this.apiUrl}/${id}/complete`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error(response.message || 'Failed to complete planning week');
        })
      );
  }

  archivePlanningWeek(id: string): Observable<PlanningWeek> {
    return this.http
      .post<ApiResponse<PlanningWeekDto>>(`${this.apiUrl}/${id}/archive`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error(response.message || 'Failed to archive planning week');
        })
      );
  }

  deletePlanningWeek(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Map API DTO to domain model
   */
  private mapDtoToDomain(dto: PlanningWeekDto): PlanningWeek {
    return {
      id: dto.id,
      planningDate: new Date(dto.planningDate),
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: dto.status as PlanningStatus,
      isFrozen: dto.isFrozen,
      clientPercent: dto.clientPercent,
      techDebtPercent: dto.techDebtPercent,
      rndPercent: dto.rndPercent,
      createdAt: new Date(dto.createdAt)
    };
  }
}
