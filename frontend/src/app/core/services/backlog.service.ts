import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  BacklogItem,
  BacklogItemDto,
  BacklogStatus,
  CreateBacklogItemRequest,
  UpdateBacklogItemRequest,
  ApiResponse
} from '../../models';

/**
 * Service for managing Backlog Item operations
 * Handles all API interactions with the backlog endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class BacklogService {
  private apiUrl = `${environment.apiUrl}/backlog`;
  private backlogItemsSubject = new BehaviorSubject<BacklogItem[]>([]);
  public backlogItems$ = this.backlogItemsSubject.asObservable();

  private activeBacklogItemsSubject = new BehaviorSubject<BacklogItem[]>([]);
  public activeBacklogItems$ = this.activeBacklogItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all backlog items
   */
  getAllBacklogItems(): Observable<BacklogItem[]> {
    return this.http
      .get<ApiResponse<BacklogItemDto[]>>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const items = response.data.map(dto => this.mapDtoToDomain(dto));
            this.backlogItemsSubject.next(items);
            return items;
          }
          return [];
        })
      );
  }

  /**
   * Get active (non-archived) backlog items
   */
  getActiveBacklogItems(): Observable<BacklogItem[]> {
    return this.http
      .get<ApiResponse<BacklogItemDto[]>>(`${this.apiUrl}/active`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const items = response.data.map(dto => this.mapDtoToDomain(dto));
            this.activeBacklogItemsSubject.next(items);
            return items;
          }
          return [];
        })
      );
  }

  /**
   * Get a specific backlog item by ID
   */
  getBacklogItemById(id: string): Observable<BacklogItem> {
    return this.http
      .get<ApiResponse<BacklogItemDto>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error('Failed to fetch backlog item');
        })
      );
  }

  /**
   * Create a new backlog item
   */
  createBacklogItem(request: CreateBacklogItemRequest): Observable<BacklogItem> {
    return this.http
      .post<ApiResponse<BacklogItemDto>>(`${this.apiUrl}`, request)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error('Failed to create backlog item');
        })
      );
  }

  /**
   * Update an existing backlog item
   */
  updateBacklogItem(
    id: string,
    request: UpdateBacklogItemRequest
  ): Observable<BacklogItem> {
    return this.http
      .put<ApiResponse<BacklogItemDto>>(`${this.apiUrl}/${id}`, request)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error('Failed to update backlog item');
        })
      );
  }

  /**
   * Archive a backlog item
   */
  archiveBacklogItem(id: string): Observable<BacklogItem> {
    return this.http
      .post<ApiResponse<BacklogItemDto>>(`${this.apiUrl}/${id}/archive`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapDtoToDomain(response.data);
          }
          throw new Error('Failed to archive backlog item');
        })
      );
  }

  /**
   * Delete a backlog item
   */
  deleteBacklogItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Map API DTO to domain model
   */
  private mapDtoToDomain(dto: BacklogItemDto): BacklogItem {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      category: dto.category as any,
      estimatedHours: dto.estimatedHours,
      status: dto.status as any,
      isArchived: dto.isArchived,
      priority: dto.priority,
      planningWeekId: dto.planningWeekId,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }
}
