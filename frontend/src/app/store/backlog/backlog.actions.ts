import { createAction, props } from '@ngrx/store';
import { BacklogItem, CreateBacklogItemRequest, UpdateBacklogItemRequest } from '../../models';

/**
 * Backlog Item Actions
 * Actions for managing backlog item state
 */

export const loadBacklogItems = createAction(
  '[Backlog List] Load Backlog Items',
  props<{ skip?: number; take?: number }>()
);

export const loadBacklogItemsSuccess = createAction(
  '[Backlog List] Load Backlog Items Success',
  props<{ items: BacklogItem[] }>()
);

export const loadBacklogItemsFailure = createAction(
  '[Backlog List] Load Backlog Items Failure',
  props<{ error: string }>()
);

export const loadActiveBacklogItems = createAction(
  '[Backlog List] Load Active Backlog Items'
);

export const loadActiveBacklogItemsSuccess = createAction(
  '[Backlog List] Load Active Backlog Items Success',
  props<{ items: BacklogItem[] }>()
);

export const loadActiveBacklogItemsFailure = createAction(
  '[Backlog List] Load Active Backlog Items Failure',
  props<{ error: string }>()
);

export const loadBacklogItemById = createAction(
  '[Backlog Detail] Load Backlog Item',
  props<{ id: string }>()
);

export const loadBacklogItemByIdSuccess = createAction(
  '[Backlog Detail] Load Backlog Item Success',
  props<{ item: BacklogItem }>()
);

export const loadBacklogItemByIdFailure = createAction(
  '[Backlog Detail] Load Backlog Item Failure',
  props<{ error: string }>()
);

export const createBacklogItem = createAction(
  '[Backlog Form] Create Backlog Item',
  props<{ request: CreateBacklogItemRequest }>()
);

export const createBacklogItemSuccess = createAction(
  '[Backlog Form] Create Backlog Item Success',
  props<{ item: BacklogItem }>()
);

export const createBacklogItemFailure = createAction(
  '[Backlog Form] Create Backlog Item Failure',
  props<{ error: string }>()
);

export const updateBacklogItem = createAction(
  '[Backlog Form] Update Backlog Item',
  props<{ id: string; request: UpdateBacklogItemRequest }>()
);

export const updateBacklogItemSuccess = createAction(
  '[Backlog Form] Update Backlog Item Success',
  props<{ item: BacklogItem }>()
);

export const updateBacklogItemFailure = createAction(
  '[Backlog Form] Update Backlog Item Failure',
  props<{ error: string }>()
);

export const archiveBacklogItem = createAction(
  '[Backlog Detail] Archive Backlog Item',
  props<{ id: string }>()
);

export const archiveBacklogItemSuccess = createAction(
  '[Backlog Detail] Archive Backlog Item Success',
  props<{ item: BacklogItem }>()
);

export const archiveBacklogItemFailure = createAction(
  '[Backlog Detail] Archive Backlog Item Failure',
  props<{ error: string }>()
);

export const deleteBacklogItem = createAction(
  '[Backlog Detail] Delete Backlog Item',
  props<{ id: string }>()
);

export const deleteBacklogItemSuccess = createAction(
  '[Backlog Detail] Delete Backlog Item Success',
  props<{ id: string }>()
);

export const deleteBacklogItemFailure = createAction(
  '[Backlog Detail] Delete Backlog Item Failure',
  props<{ error: string }>()
);

export const clearBacklogError = createAction(
  '[Backlog] Clear Error'
);
