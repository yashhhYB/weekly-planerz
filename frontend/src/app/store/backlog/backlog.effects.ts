import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { BacklogService } from '../../core/services';
import * as BacklogActions from './backlog.actions';

/**
 * Backlog Effects
 * Side effects for backlog item operations
 */
@Injectable()
export class BacklogEffects {
  
  loadBacklogItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BacklogActions.loadBacklogItems),
      switchMap((action) =>
        this.backlogService.getAllBacklogItems().pipe(
          map(items => BacklogActions.loadBacklogItemsSuccess({ items })),
          catchError(error => of(BacklogActions.loadBacklogItemsFailure({ 
            error: error.message || 'Failed to load backlog items' 
          })))
        )
      )
    )
  );

  loadActiveBacklogItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BacklogActions.loadActiveBacklogItems),
      switchMap(() =>
        this.backlogService.getActiveBacklogItems().pipe(
          map(items => BacklogActions.loadActiveBacklogItemsSuccess({ items })),
          catchError(error => of(BacklogActions.loadActiveBacklogItemsFailure({ 
            error: error.message || 'Failed to load active backlog items' 
          })))
        )
      )
    )
  );

  loadBacklogItemById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BacklogActions.loadBacklogItemById),
      switchMap((action) =>
        this.backlogService.getBacklogItemById(action.id).pipe(
          map(item => BacklogActions.loadBacklogItemByIdSuccess({ item })),
          catchError(error => of(BacklogActions.loadBacklogItemByIdFailure({ 
            error: error.message || 'Failed to load backlog item' 
          })))
        )
      )
    )
  );

  createBacklogItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BacklogActions.createBacklogItem),
      mergeMap((action) =>
        this.backlogService.createBacklogItem(action.request).pipe(
          map(item => BacklogActions.createBacklogItemSuccess({ item })),
          catchError(error => of(BacklogActions.createBacklogItemFailure({ 
            error: error.message || 'Failed to create backlog item' 
          })))
        )
      )
    )
  );

  updateBacklogItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BacklogActions.updateBacklogItem),
      mergeMap((action) =>
        this.backlogService.updateBacklogItem(action.id, action.request).pipe(
          map(item => BacklogActions.updateBacklogItemSuccess({ item })),
          catchError(error => of(BacklogActions.updateBacklogItemFailure({ 
            error: error.message || 'Failed to update backlog item' 
          })))
        )
      )
    )
  );

  archiveBacklogItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BacklogActions.archiveBacklogItem),
      mergeMap((action) =>
        this.backlogService.deleteBacklogItem(action.id).pipe(
          map(() => BacklogActions.archiveBacklogItemSuccess({ 
            item: { id: action.id } as any // Placeholder for archived item
          })),
          catchError(error => of(BacklogActions.archiveBacklogItemFailure({ 
            error: error.message || 'Failed to archive backlog item' 
          })))
        )
      )
    )
  );

  deleteBacklogItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BacklogActions.deleteBacklogItem),
      mergeMap((action) =>
        this.backlogService.deleteBacklogItem(action.id).pipe(
          map(() => BacklogActions.deleteBacklogItemSuccess({ id: action.id })),
          catchError(error => of(BacklogActions.deleteBacklogItemFailure({ 
            error: error.message || 'Failed to delete backlog item' 
          })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backlogService: BacklogService
  ) {}
}
