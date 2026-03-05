import { createAction, props } from '@ngrx/store';
import { PlanningWeek, CreatePlanningWeekRequest, UpdatePlanningWeekRequest } from '../../models';

/**
 * Planning Week Actions
 * Actions for managing planning week state
 */

export const loadPlanningWeeks = createAction(
  '[Planning List] Load Planning Weeks',
  props<{ skip?: number; take?: number }>()
);

export const loadPlanningWeeksSuccess = createAction(
  '[Planning List] Load Planning Weeks Success',
  props<{ weeks: PlanningWeek[] }>()
);

export const loadPlanningWeeksFailure = createAction(
  '[Planning List] Load Planning Weeks Failure',
  props<{ error: string }>()
);

export const loadPlanningWeekById = createAction(
  '[Planning Detail] Load Planning Week',
  props<{ id: string }>()
);

export const loadPlanningWeekByIdSuccess = createAction(
  '[Planning Detail] Load Planning Week Success',
  props<{ week: PlanningWeek }>()
);

export const loadPlanningWeekByIdFailure = createAction(
  '[Planning Detail] Load Planning Week Failure',
  props<{ error: string }>()
);

export const createPlanningWeek = createAction(
  '[Planning Form] Create Planning Week',
  props<{ request: CreatePlanningWeekRequest }>()
);

export const createPlanningWeekSuccess = createAction(
  '[Planning Form] Create Planning Week Success',
  props<{ week: PlanningWeek }>()
);

export const createPlanningWeekFailure = createAction(
  '[Planning Form] Create Planning Week Failure',
  props<{ error: string }>()
);

export const updatePlanningWeek = createAction(
  '[Planning Form] Update Planning Week',
  props<{ id: string; request: UpdatePlanningWeekRequest }>()
);

export const updatePlanningWeekSuccess = createAction(
  '[Planning Form] Update Planning Week Success',
  props<{ week: PlanningWeek }>()
);

export const updatePlanningWeekFailure = createAction(
  '[Planning Form] Update Planning Week Failure',
  props<{ error: string }>()
);

export const freezePlanningWeek = createAction(
  '[Planning Detail] Freeze Planning Week',
  props<{ id: string }>()
);

export const freezePlanningWeekSuccess = createAction(
  '[Planning Detail] Freeze Planning Week Success',
  props<{ week: PlanningWeek }>()
);

export const freezePlanningWeekFailure = createAction(
  '[Planning Detail] Freeze Planning Week Failure',
  props<{ error: string }>()
);

export const deletePlanningWeek = createAction(
  '[Planning Detail] Delete Planning Week',
  props<{ id: string }>()
);

export const deletePlanningWeekSuccess = createAction(
  '[Planning Detail] Delete Planning Week Success',
  props<{ id: string }>()
);

export const deletePlanningWeekFailure = createAction(
  '[Planning Detail] Delete Planning Week Failure',
  props<{ error: string }>()
);

export const startPlanningWeek = createAction(
  '[Planning Detail] Start Planning Week',
  props<{ id: string }>()
);

export const startPlanningWeekSuccess = createAction(
  '[Planning Detail] Start Planning Week Success',
  props<{ week: PlanningWeek }>()
);

export const startPlanningWeekFailure = createAction(
  '[Planning Detail] Start Planning Week Failure',
  props<{ error: string }>()
);

export const completePlanningWeek = createAction(
  '[Planning Detail] Complete Planning Week',
  props<{ id: string }>()
);

export const completePlanningWeekSuccess = createAction(
  '[Planning Detail] Complete Planning Week Success',
  props<{ week: PlanningWeek }>()
);

export const completePlanningWeekFailure = createAction(
  '[Planning Detail] Complete Planning Week Failure',
  props<{ error: string }>()
);

export const archivePlanningWeek = createAction(
  '[Planning Detail] Archive Planning Week',
  props<{ id: string }>()
);

export const archivePlanningWeekSuccess = createAction(
  '[Planning Detail] Archive Planning Week Success',
  props<{ week: PlanningWeek }>()
);

export const archivePlanningWeekFailure = createAction(
  '[Planning Detail] Archive Planning Week Failure',
  props<{ error: string }>()
);

export const clearPlanningError = createAction(
  '[Planning] Clear Error'
);
