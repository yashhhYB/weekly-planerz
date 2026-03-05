import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap, tap } from 'rxjs/operators';
import { BacklogService } from '../../core/services';
import { ToastService } from '../../core/services/toast.service';
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
        this.backlogService.archiveBacklogItem(action.id).pipe(
          map(item => BacklogActions.archiveBacklogItemSuccess({ item })),
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

  // Toast notifications
  showSuccessToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        BacklogActions.createBacklogItemSuccess,
        BacklogActions.updateBacklogItemSuccess,
        BacklogActions.archiveBacklogItemSuccess
      ),
      tap((action) => {
        const messages: Record<string, string> = {
          '[Backlog Form] Create Backlog Item Success': 'Backlog item created!',
          '[Backlog Form] Update Backlog Item Success': 'Backlog item updated!',
          '[Backlog Detail] Archive Backlog Item Success': 'Backlog item archived!'
        };
        this.toastService.success(messages[action.type] || 'Operation successful!');
      })
    ), { dispatch: false }
  );

  showDeleteToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BacklogActions.deleteBacklogItemSuccess),
      tap(() => this.toastService.success('Backlog item deleted!'))
    ), { dispatch: false }
  );

  showErrorToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        BacklogActions.createBacklogItemFailure,
        BacklogActions.updateBacklogItemFailure,
        BacklogActions.archiveBacklogItemFailure,
        BacklogActions.deleteBacklogItemFailure
      ),
      tap((action) => this.toastService.error(action.error))
    ), { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private backlogService: BacklogService,
    private toastService: ToastService
  ) {}
}
