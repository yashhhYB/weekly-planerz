import { PlanningState } from './planning/planning.reducer';
import { BacklogState } from './backlog/backlog.reducer';
import { TeamState } from './team/team.reducer';

/**
 * App Store State
 * Root state interface for the entire application
 */
export interface AppStoreState {
  planning: PlanningState;
  backlog: BacklogState;
  team: TeamState;
}

export * from './planning';
export * from './backlog';
export * from './team';
