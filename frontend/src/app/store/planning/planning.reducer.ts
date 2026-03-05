import { createReducer, on } from '@ngrx/store';
import { PlanningWeek } from '../../models';
import * as PlanningActions from './planning.actions';

/**
 * Planning State
 * Manages the state of planning weeks in the application
 */
export interface PlanningState {
  weeks: PlanningWeek[];
  selectedWeek: PlanningWeek | null;
  loading: boolean;
  error: string | null;
}

export const initialPlanningState: PlanningState = {
  weeks: [],
  selectedWeek: null,
  loading: false,
  error: null
};

export const planningReducer = createReducer(
  initialPlanningState,
  
  // Load Planning Weeks
  on(PlanningActions.loadPlanningWeeks, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PlanningActions.loadPlanningWeeksSuccess, (state, { weeks }) => ({
    ...state,
    weeks,
    loading: false
  })),
  on(PlanningActions.loadPlanningWeeksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Load Planning Week by ID
  on(PlanningActions.loadPlanningWeekById, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PlanningActions.loadPlanningWeekByIdSuccess, (state, { week }) => ({
    ...state,
    selectedWeek: week,
    loading: false
  })),
  on(PlanningActions.loadPlanningWeekByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create Planning Week
  on(PlanningActions.createPlanningWeek, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PlanningActions.createPlanningWeekSuccess, (state, { week }) => ({
    ...state,
    weeks: [...state.weeks, week],
    selectedWeek: week,
    loading: false
  })),
  on(PlanningActions.createPlanningWeekFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Update Planning Week
  on(PlanningActions.updatePlanningWeek, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PlanningActions.updatePlanningWeekSuccess, (state, { week }) => ({
    ...state,
    weeks: state.weeks.map(w => w.id === week.id ? week : w),
    selectedWeek: week,
    loading: false
  })),
  on(PlanningActions.updatePlanningWeekFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Freeze Planning Week
  on(PlanningActions.freezePlanningWeek, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PlanningActions.freezePlanningWeekSuccess, (state, { week }) => ({
    ...state,
    weeks: state.weeks.map(w => w.id === week.id ? week : w),
    selectedWeek: week,
    loading: false
  })),
  on(PlanningActions.freezePlanningWeekFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Start Planning Week
  on(PlanningActions.startPlanningWeek, (state) => ({
    ...state, loading: true, error: null
  })),
  on(PlanningActions.startPlanningWeekSuccess, (state, { week }) => ({
    ...state,
    weeks: state.weeks.map(w => w.id === week.id ? week : w),
    selectedWeek: week, loading: false
  })),
  on(PlanningActions.startPlanningWeekFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Complete Planning Week
  on(PlanningActions.completePlanningWeek, (state) => ({
    ...state, loading: true, error: null
  })),
  on(PlanningActions.completePlanningWeekSuccess, (state, { week }) => ({
    ...state,
    weeks: state.weeks.map(w => w.id === week.id ? week : w),
    selectedWeek: week, loading: false
  })),
  on(PlanningActions.completePlanningWeekFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Archive Planning Week
  on(PlanningActions.archivePlanningWeek, (state) => ({
    ...state, loading: true, error: null
  })),
  on(PlanningActions.archivePlanningWeekSuccess, (state, { week }) => ({
    ...state,
    weeks: state.weeks.map(w => w.id === week.id ? week : w),
    selectedWeek: week, loading: false
  })),
  on(PlanningActions.archivePlanningWeekFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),
  
  // Delete Planning Week
  on(PlanningActions.deletePlanningWeek, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PlanningActions.deletePlanningWeekSuccess, (state, { id }) => ({
    ...state,
    weeks: state.weeks.filter(w => w.id !== id),
    selectedWeek: state.selectedWeek?.id === id ? null : state.selectedWeek,
    loading: false
  })),
  on(PlanningActions.deletePlanningWeekFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Clear Error
  on(PlanningActions.clearPlanningError, (state) => ({
    ...state,
    error: null
  }))
);
