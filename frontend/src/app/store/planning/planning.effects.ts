import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap, tap } from 'rxjs/operators';
import { PlanningService } from '../../core/services';
import { ToastService } from '../../core/services/toast.service';
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

  startPlanningWeek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.startPlanningWeek),
      mergeMap((action) =>
        this.planningService.startPlanningWeek(action.id).pipe(
          map(week => PlanningActions.startPlanningWeekSuccess({ week })),
          catchError(error => of(PlanningActions.startPlanningWeekFailure({ 
            error: error.message || 'Failed to start planning week' 
          })))
        )
      )
    )
  );

  completePlanningWeek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.completePlanningWeek),
      mergeMap((action) =>
        this.planningService.completePlanningWeek(action.id).pipe(
          map(week => PlanningActions.completePlanningWeekSuccess({ week })),
          catchError(error => of(PlanningActions.completePlanningWeekFailure({ 
            error: error.message || 'Failed to complete planning week' 
          })))
        )
      )
    )
  );

  archivePlanningWeek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.archivePlanningWeek),
      mergeMap((action) =>
        this.planningService.archivePlanningWeek(action.id).pipe(
          map(week => PlanningActions.archivePlanningWeekSuccess({ week })),
          catchError(error => of(PlanningActions.archivePlanningWeekFailure({ 
            error: error.message || 'Failed to archive planning week' 
          })))
        )
      )
    )
  );

  // Toast notifications for success actions
  showSuccessToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PlanningActions.createPlanningWeekSuccess,
        PlanningActions.updatePlanningWeekSuccess,
        PlanningActions.freezePlanningWeekSuccess,
        PlanningActions.startPlanningWeekSuccess,
        PlanningActions.completePlanningWeekSuccess,
        PlanningActions.archivePlanningWeekSuccess
      ),
      tap((action) => {
        const messages: Record<string, string> = {
          '[Planning Form] Create Planning Week Success': 'Planning week created successfully!',
          '[Planning Form] Update Planning Week Success': 'Planning week updated successfully!',
          '[Planning Detail] Freeze Planning Week Success': 'Planning week frozen!',
          '[Planning Detail] Start Planning Week Success': 'Planning week started!',
          '[Planning Detail] Complete Planning Week Success': 'Planning week completed!',
          '[Planning Detail] Archive Planning Week Success': 'Planning week archived!'
        };
        this.toastService.success(messages[action.type] || 'Operation successful!');
      })
    ), { dispatch: false }
  );

  showDeleteToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlanningActions.deletePlanningWeekSuccess),
      tap(() => this.toastService.success('Planning week deleted!'))
    ), { dispatch: false }
  );

  showErrorToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PlanningActions.createPlanningWeekFailure,
        PlanningActions.updatePlanningWeekFailure,
        PlanningActions.freezePlanningWeekFailure,
        PlanningActions.startPlanningWeekFailure,
        PlanningActions.completePlanningWeekFailure,
        PlanningActions.archivePlanningWeekFailure,
        PlanningActions.deletePlanningWeekFailure
      ),
      tap((action) => this.toastService.error(action.error))
    ), { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private planningService: PlanningService,
    private toastService: ToastService
  ) {}
}
