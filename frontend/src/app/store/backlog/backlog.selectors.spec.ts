import * as fromBacklogSelectors from './backlog.selectors';
import { BacklogState } from './backlog.reducer';
import { BacklogItem, BacklogCategory } from '../../models';

describe('BacklogSelectors', () => {
  const mockBacklogItem: BacklogItem = {
    id: '1',
    title: 'Test Task',
    description: 'Test description',
    category: BacklogCategory.ClientFocused,
    estimatedHours: 5,
    isArchived: false,
    createdAt: new Date()
  };

  const mockTechDebtItem: BacklogItem = {
    ...mockBacklogItem,
    id: '2',
    title: 'Tech Debt Task',
    category: BacklogCategory.TechDebt
  };

  const mockState: BacklogState = {
    items: [mockBacklogItem, mockTechDebtItem],
    selectedItem: null,
    activeItems: [],
    loading: false,
    error: null
  };

  it('should select all backlog items', () => {
    const result = fromBacklogSelectors.selectAllBacklogItems.projector(mockState);
    expect(result.length).toBe(2);
  });

  it('should select loading state', () => {
    const result = fromBacklogSelectors.selectBacklogLoading.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select error state', () => {
    const result = fromBacklogSelectors.selectBacklogError.projector(mockState);
    expect(result).toBeNull();
  });

  it('should select backlog item by id', () => {
    const selector = fromBacklogSelectors.selectBacklogItemById('1');
    const result = selector.projector([mockBacklogItem, mockTechDebtItem]);
    expect(result).toEqual(mockBacklogItem);
  });

  it('should return undefined for non-existent backlog item', () => {
    const selector = fromBacklogSelectors.selectBacklogItemById('99');
    const result = selector.projector([mockBacklogItem]);
    expect(result).toBeUndefined();
  });

  it('should select active backlog items', () => {
    const selector = fromBacklogSelectors.selectActiveBacklogItems;
    const result = selector.projector({ ...mockState, activeItems: [mockBacklogItem, mockTechDebtItem] });
    expect(result.length).toBeGreaterThan(0);
  });

  it('should select backlog items by category', () => {
    const selector = fromBacklogSelectors.selectBacklogItemsByCategory(BacklogCategory.ClientFocused);
    const result = (selector as any).projector([mockBacklogItem, mockTechDebtItem]);
    expect(result.length).toBe(1);
    expect(result[0].category).toBe(BacklogCategory.ClientFocused);
  });

  it('should select backlog item count', () => {
    const selector = fromBacklogSelectors.selectBacklogItemsCount;
    const result = selector.projector([mockBacklogItem, mockTechDebtItem]);
    expect(result).toBe(2);
  });

  it('should handle empty items array', () => {
    const emptyState: BacklogState = {
      items: [],
      selectedItem: null,
      activeItems: [],
      loading: false,
      error: null
    };
    const result = fromBacklogSelectors.selectAllBacklogItems.projector(emptyState);
    expect(result).toEqual([]);
  });
});
