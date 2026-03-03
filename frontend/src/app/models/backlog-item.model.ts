/**
 * Category enum for backlog items
 */
export enum BacklogCategory {
  Work = 'Work',
  Personal = 'Personal',
  Learning = 'Learning',
  Health = 'Health',
  Finance = 'Finance',
  Relationships = 'Relationships'
}

/**
 * Status enum for backlog items
 */
export enum BacklogStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Archived = 'Archived'
}

/**
 * Backlog Item domain model
 * Represents a task or item in the backlog
 */
export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  category: BacklogCategory;
  estimatedHours: number;
  status: BacklogStatus;
  isArchived: boolean;
  priority: number; // 1-5, where 1 is highest
  planningWeekId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * BacklogItem DTO for communication with API
 */
export interface BacklogItemDto {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  status: string;
  isArchived: boolean;
  priority: number;
  planningWeekId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Backlog Item request
 */
export interface CreateBacklogItemRequest {
  title: string;
  description: string;
  category: BacklogCategory;
  estimatedHours: number;
  priority: number;
  status?: BacklogStatus; // Optional on create, defaults to Pending
}

/**
 * Update Backlog Item request
 */
export interface UpdateBacklogItemRequest {
  title: string;
  description: string;
  category: BacklogCategory;
  estimatedHours: number;
  status: BacklogStatus;
  priority: number;
}
