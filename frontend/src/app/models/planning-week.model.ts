/**
 * API Response wrapper for standardized responses from backend
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

/**
 * Planning Status enum matching backend PlanningStatus
 */
export enum PlanningStatus {
  Setup = 1,
  InProgress = 2,
  Completed = 3,
  Archived = 4
}

/**
 * Planning Week domain model
 * Matches backend PlanningWeekDto exactly
 */
export interface PlanningWeek {
  id: string;
  planningDate: Date;
  startDate: Date;
  endDate: Date;
  status: PlanningStatus;
  isFrozen: boolean;
  clientPercent: number;
  techDebtPercent: number;
  rndPercent: number;
  createdAt: Date;
}

/**
 * PlanningWeek DTO for communication with API
 */
export interface PlanningWeekDto {
  id: string;
  planningDate: string;
  startDate: string;
  endDate: string;
  status: number;
  isFrozen: boolean;
  clientPercent: number;
  techDebtPercent: number;
  rndPercent: number;
  createdAt: string;
}

/**
 * Create Planning Week request - matches backend CreatePlanningWeekRequest
 */
export interface CreatePlanningWeekRequest {
  planningDate: string; // ISO date - must be Tuesday
  clientPercent: number;
  techDebtPercent: number;
  rndPercent: number;
}

/**
 * Update Planning Week request - matches backend UpdatePlanningWeekRequest
 */
export interface UpdatePlanningWeekRequest {
  clientPercent: number;
  techDebtPercent: number;
  rndPercent: number;
}
