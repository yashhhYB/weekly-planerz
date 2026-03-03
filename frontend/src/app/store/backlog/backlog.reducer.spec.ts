import { BacklogState, backlogReducer, initialBacklogState } from './backlog.reducer';
import * as BacklogActions from './backlog.actions';
import { BacklogItem, BacklogCategory, BacklogStatus } from '../../models';

describe('BacklogReducer', () => {
  const mockBacklogItem: BacklogItem = {
    id: '1',
    title: 'Test Task',
    description: 'Test description',
    category: BacklogCategory.Work,
    priority: 3,
    estimatedHours: 5,
    status: BacklogStatus.Pending,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('should return the initial state', () => {
    const action = { type: 'UNKNOWN' };
    const result = backlogReducer(undefined, action as any);
    expect(result).toEqual(initialBacklogState);
  });

  it('should handle loadBacklogItems', () => {
    const action = BacklogActions.loadBacklogItems({ skip: 0, take: 50 });
    const state = backlogReducer(initialBacklogState, action);
    expect(state.loading).toBe(true);
  });

  it('should handle loadBacklogItemsSuccess', () => {
    const state = backlogReducer(
      { ...initialBacklogState, loading: true },
      BacklogActions.loadBacklogItemsSuccess({ items: [mockBacklogItem] })
    );
    expect(state.loading).toBe(false);
    expect(state.items.length).toBe(1);
    expect(state.error).toBeNull();
  });

  it('should handle loadBacklogItemsFailure', () => {
    const errorMsg = 'Failed to load';
    const state = backlogReducer(
      { ...initialBacklogState, loading: true },
      BacklogActions.loadBacklogItemsFailure({ error: errorMsg })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMsg);
  });

  it('should handle createBacklogItem', () => {
    const action = BacklogActions.createBacklogItem({ 
      request: {
        title: 'New Task',
        category: BacklogCategory.Work,
        priority: 3,
        estimatedHours: 5
      }
    });
    const state = backlogReducer(initialBacklogState, action);
    expect(state.loading).toBe(true);
  });

  it('should handle createBacklogItemSuccess', () => {
    const state = backlogReducer(
      { ...initialBacklogState, loading: true },
      BacklogActions.createBacklogItemSuccess({ item: mockBacklogItem })
    );
    expect(state.loading).toBe(false);
    expect(state.items.length).toBe(1);
    expect(state.items[0].title).toBe('Test Task');
  });

  it('should handle updateBacklogItem', () => {
    const state = backlogReducer(
      { ...initialBacklogState, items: [mockBacklogItem] },
      BacklogActions.updateBacklogItem({ 
        id: '1', 
        request: { title: 'Updated Task' }
      })
    );
    expect(state.loading).toBe(true);
  });

  it('should handle updateBacklogItemSuccess', () => {
    const updated = { ...mockBacklogItem, title: 'Updated Task' };
    const state = backlogReducer(
      { ...initialBacklogState, loading: true, items: [mockBacklogItem] },
      BacklogActions.updateBacklogItemSuccess({ item: updated })
    );
    expect(state.loading).toBe(false);
    expect(state.items[0].title).toBe('Updated Task');
  });

  it('should handle archiveBacklogItem', () => {
    const state = backlogReducer(
      { ...initialBacklogState, items: [mockBacklogItem] },
      BacklogActions.archiveBacklogItem({ id: '1' })
    );
    expect(state.loading).toBe(true);
  });

  it('should handle archiveBacklogItemSuccess', () => {
    const archived = { ...mockBacklogItem, isArchived: true };
    const state = backlogReducer(
      { ...initialState, loading: true, items: [mockBacklogItem] },
      BacklogActions.archiveBacklogItemSuccess({ item: archived })
    );
    expect(state.loading).toBe(false);
    expect(state.items[0].isArchived).toBe(true);
  });

  it('should handle deleteBacklogItem', () => {
    const state = backlogReducer(
      { ...initialBacklogState, items: [mockBacklogItem] },
      BacklogActions.deleteBacklogItem({ id: '1' })
    );
    expect(state.loading).toBe(true);
  });

  it('should handle deleteBacklogItemSuccess', () => {
    const state = backlogReducer(
      { 
        ...initialBacklogState, 
        loading: true, 
        items: [mockBacklogItem] 
      },
      BacklogActions.deleteBacklogItemSuccess({ id: '1' })
    );
    expect(state.loading).toBe(false);
    expect(state.items.length).toBe(0);
  });

  it('should handle clearBacklogError', () => {
    const state = backlogReducer(
      { ...initialBacklogState, error: 'Some error' },
      BacklogActions.clearBacklogError()
    );
    expect(state.error).toBeNull();
  });

  it('should handle loadActiveBacklogItems', () => {
    const action = BacklogActions.loadActiveBacklogItems({ skip: 0, take: 50 });
    const state = backlogReducer(initialState, action);
    expect(state.loading).toBe(true);
  });
});
