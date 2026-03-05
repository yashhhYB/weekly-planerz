/**
 * Category enum for backlog items - matches backend BacklogItemCategory
 */
export enum BacklogCategory {
  ClientFocused = 1,
  TechDebt = 2,
  RnD = 3
}

/**
 * Helper to get category display label
 */
export const BacklogCategoryLabels: Record<number, string> = {
  [BacklogCategory.ClientFocused]: 'Client Focused',
  [BacklogCategory.TechDebt]: 'Tech Debt',
  [BacklogCategory.RnD]: 'R&D'
};

/**
 * Backlog Item domain model
 * Matches backend BacklogItemDto exactly
 */
export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  category: BacklogCategory;
  estimatedHours: number;
  isArchived: boolean;
  createdAt: Date;
}

/**
 * BacklogItem DTO for communication with API
 */
export interface BacklogItemDto {
  id: string;
  title: string;
  description: string;
  category: number;
  estimatedHours: number;
  isArchived: boolean;
  createdAt: string;
}

/**
 * Create Backlog Item request - matches backend CreateBacklogItemRequest
 */
export interface CreateBacklogItemRequest {
  title: string;
  description: string;
  category: number;
  estimatedHours: number;
}

/**
 * Update Backlog Item request - matches backend UpdateBacklogItemRequest
 */
export interface UpdateBacklogItemRequest {
  title: string;
  description: string;
  category: number;
  estimatedHours: number;
}
