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
 * Planning Week domain model
 * Represents a weekly plan with planning details
 */
export interface PlanningWeek {
  id: string;
  weekStartDate: Date;
  weekEndDate: Date;
  goals: string;
  keyActivities: string;
  reflection: string;
  healthScore: number;
  productivity: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PlanningWeek DTO for communication with API
 */
export interface PlanningWeekDto {
  id: string;
  weekStartDate: string; // ISO date string
  weekEndDate: string;
  goals: string;
  keyActivities: string;
  reflection: string;
  healthScore: number;
  productivity: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Planning Week request
 */
export interface CreatePlanningWeekRequest {
  weekStartDate: string; // ISO date - must be Tuesday
  goals: string;
  keyActivities: string;
  reflection?: string; // Optional on create
  healthScore: number; // 1-10
  productivity: number; // percentage
}

/**
 * Update Planning Week request
 */
export interface UpdatePlanningWeekRequest {
  goals: string;
  keyActivities: string;
  reflection: string;
  healthScore: number;
  productivity: number;
}
