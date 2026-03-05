import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BacklogState } from './backlog.reducer';

/**
 * Backlog Selectors
 * Selectors for accessing backlog state
 */

export const selectBacklogState = createFeatureSelector<BacklogState>('backlog');

export const selectAllBacklogItems = createSelector(
  selectBacklogState,
  (state) => state.items
);

export const selectActiveBacklogItems = createSelector(
  selectBacklogState,
  (state) => state.activeItems
);

export const selectSelectedBacklogItem = createSelector(
  selectBacklogState,
  (state) => state.selectedItem
);

export const selectBacklogLoading = createSelector(
  selectBacklogState,
  (state) => state.loading
);

export const selectBacklogError = createSelector(
  selectBacklogState,
  (state) => state.error
);

export const selectBacklogItemById = (id: string) =>
  createSelector(
    selectAllBacklogItems,
    (items) => items.find(i => i.id === id)
  );

export const selectBacklogItemsCount = createSelector(
  selectAllBacklogItems,
  (items) => items.length
);

export const selectBacklogItemsByCategory = (category: number) =>
  createSelector(
    selectAllBacklogItems,
    (items) => items.filter(i => i.category === category)
  );
