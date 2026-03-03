import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { PlanningService } from '../../core/services';
import * as PlanningActions from './planning.actions';

/**
 * Planning Effects
 * Side effects for planning week operations
 */
@Injectable()
export class PlanningEffects {
  
  loadPlanningWeeks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.loadPlanningWeeks),
      switchMap((action) =>
        this.planningService.getAllPlanningWeeks().pipe(
          map(weeks => PlanningActions.loadPlanningWeeksSuccess({ weeks })),
          catchError(error => of(PlanningActions.loadPlanningWeeksFailure({ 
            error: error.message || 'Failed to load planning weeks' 
          })))
        )
      )
    )
  );

  loadPlanningWeekById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.loadPlanningWeekById),
      switchMap((action) =>
        this.planningService.getPlanningWeekById(action.id).pipe(
          map(week => PlanningActions.loadPlanningWeekByIdSuccess({ week })),
          catchError(error => of(PlanningActions.loadPlanningWeekByIdFailure({ 
            error: error.message || 'Failed to load planning week' 
          })))
        )
      )
    )
  );

  createPlanningWeek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.createPlanningWeek),
      mergeMap((action) =>
        this.planningService.createPlanningWeek(action.request).pipe(
          map(week => PlanningActions.createPlanningWeekSuccess({ week })),
          catchError(error => of(PlanningActions.createPlanningWeekFailure({ 
            error: error.message || 'Failed to create planning week' 
          })))
        )
      )
    )
  );

  updatePlanningWeek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.updatePlanningWeek),
      mergeMap((action) =>
        this.planningService.updatePlanningWeek(action.id, action.request).pipe(
          map(week => PlanningActions.updatePlanningWeekSuccess({ week })),
          catchError(error => of(PlanningActions.updatePlanningWeekFailure({ 
            error: error.message || 'Failed to update planning week' 
          })))
        )
      )
    )
  );

  freezePlanningWeek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.freezePlanningWeek),
      mergeMap((action) =>
        this.planningService.freezePlanningWeek(action.id).pipe(
          map(week => PlanningActions.freezePlanningWeekSuccess({ week })),
          catchError(error => of(PlanningActions.freezePlanningWeekFailure({ 
            error: error.message || 'Failed to freeze planning week' 
          })))
        )
      )
    )
  );

  deletePlanningWeek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.deletePlanningWeek),
      mergeMap((action) =>
        this.planningService.deletePlanningWeek(action.id).pipe(
          map(() => PlanningActions.deletePlanningWeekSuccess({ id: action.id })),
          catchError(error => of(PlanningActions.deletePlanningWeekFailure({ 
            error: error.message || 'Failed to delete planning week' 
          })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private planningService: PlanningService
  ) {}
}
