import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  PlanningWeek,
  PlanningWeekDto,
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
  private planningWeeksSubject = new BehaviorSubject<PlanningWeek[]>([]);
  public planningWeeks$ = this.planningWeeksSubject.asObservable();

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
            const weeks = response.data.map(dto => this.mapDtoToDomain(dto));
            this.planningWeeksSubject.next(weeks);
            return weeks;
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
          throw new Error('Failed to create planning week');
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
          throw new Error('Failed to update planning week');
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
  deletePlanningWeek(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Map API DTO to domain model
   */
  private mapDtoToDomain(dto: PlanningWeekDto): PlanningWeek {
    return {
      id: dto.id,
      weekStartDate: new Date(dto.weekStartDate),
      weekEndDate: new Date(dto.weekEndDate),
      goals: dto.goals,
      keyActivities: dto.keyActivities,
      reflection: dto.reflection,
      healthScore: dto.healthScore,
      productivity: dto.productivity,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }
}
