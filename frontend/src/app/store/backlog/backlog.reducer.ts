import { createReducer, on } from '@ngrx/store';
import { BacklogItem } from '../../models';
import * as BacklogActions from './backlog.actions';

/**
 * Backlog State
 * Manages the state of backlog items in the application
 */
export interface BacklogState {
  items: BacklogItem[];
  selectedItem: BacklogItem | null;
  activeItems: BacklogItem[];
  loading: boolean;
  error: string | null;
}

export const initialBacklogState: BacklogState = {
  items: [],
  selectedItem: null,
  activeItems: [],
  loading: false,
  error: null
};

export const backlogReducer = createReducer(
  initialBacklogState,
  
  // Load Backlog Items
  on(BacklogActions.loadBacklogItems, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BacklogActions.loadBacklogItemsSuccess, (state, { items }) => ({
    ...state,
    items,
    loading: false
  })),
  on(BacklogActions.loadBacklogItemsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Load Active Backlog Items
  on(BacklogActions.loadActiveBacklogItems, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BacklogActions.loadActiveBacklogItemsSuccess, (state, { items }) => ({
    ...state,
    activeItems: items,
    loading: false
  })),
  on(BacklogActions.loadActiveBacklogItemsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Load Backlog Item by ID
  on(BacklogActions.loadBacklogItemById, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BacklogActions.loadBacklogItemByIdSuccess, (state, { item }) => ({
    ...state,
    selectedItem: item,
    loading: false
  })),
  on(BacklogActions.loadBacklogItemByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create Backlog Item
  on(BacklogActions.createBacklogItem, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BacklogActions.createBacklogItemSuccess, (state, { item }) => ({
    ...state,
    items: [...state.items, item],
    selectedItem: item,
    loading: false
  })),
  on(BacklogActions.createBacklogItemFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Update Backlog Item
  on(BacklogActions.updateBacklogItem, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BacklogActions.updateBacklogItemSuccess, (state, { item }) => ({
    ...state,
    items: state.items.map(i => i.id === item.id ? item : i),
    selectedItem: item,
    loading: false
  })),
  on(BacklogActions.updateBacklogItemFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Archive Backlog Item
  on(BacklogActions.archiveBacklogItem, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BacklogActions.archiveBacklogItemSuccess, (state, { item }) => ({
    ...state,
    items: state.items.map(i => i.id === item.id ? item : i),
    selectedItem: item,
    loading: false
  })),
  on(BacklogActions.archiveBacklogItemFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Delete Backlog Item
  on(BacklogActions.deleteBacklogItem, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BacklogActions.deleteBacklogItemSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter(i => i.id !== id),
    selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
    loading: false
  })),
  on(BacklogActions.deleteBacklogItemFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Clear Error
  on(BacklogActions.clearBacklogError, (state) => ({
    ...state,
    error: null
  }))
);
