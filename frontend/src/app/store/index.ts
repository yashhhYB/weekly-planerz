import { PlanningState } from './planning/planning.reducer';
import { BacklogState } from './backlog/backlog.reducer';

/**
 * App Store State
 * Root state interface for the entire application
 */
export interface AppStoreState {
  planning: PlanningState;
  backlog: BacklogState;
}

export * from './planning';
export * from './backlog';
