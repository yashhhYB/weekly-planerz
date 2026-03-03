import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlanningState } from './planning.reducer';

/**
 * Planning Selectors
 * Selectors for accessing planning state
 */

export const selectPlanningState = createFeatureSelector<PlanningState>('planning');

export const selectAllPlanningWeeks = createSelector(
  selectPlanningState,
  (state) => state.weeks
);

export const selectSelectedPlanningWeek = createSelector(
  selectPlanningState,
  (state) => state.selectedWeek
);

export const selectPlanningLoading = createSelector(
  selectPlanningState,
  (state) => state.loading
);

export const selectPlanningError = createSelector(
  selectPlanningState,
  (state) => state.error
);

export const selectPlanningWeekById = (id: string) =>
  createSelector(
    selectAllPlanningWeeks,
    (weeks) => weeks.find(w => w.id === id)
  );

export const selectPlanningWeeksCount = createSelector(
  selectAllPlanningWeeks,
  (weeks) => weeks.length
);
